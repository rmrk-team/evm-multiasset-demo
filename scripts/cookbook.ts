import { ethers } from 'hardhat';
import { CookBook } from '../typechain-types';

async function main() {
    const pricePerMint = ethers.utils.parseEther('0.05');
    const totalTokens = 2; // Total CookBook tokens mintable

    const [owner, cooker1] = await ethers.getSigners();

    // Aliasing wallet signers
    const MASTER = owner;
    const ALICE = cooker1;

    // Create contract factory and deploy
    const bookFactory = await ethers.getContractFactory('CookBook');

    const cookBookInstance: CookBook = await bookFactory.deploy(
        {
            erc20TokenAddress: ethers.constants.AddressZero,
            tokenUriIsEnumerable: true,
            royaltyRecipient: ethers.constants.AddressZero,
            royaltyPercentageBps: 0,    // the address is 0x0 so it is better to put 0 until a change
            maxSupply: 2,
            pricePerMint: pricePerMint
        }
    );

    await cookBookInstance.deployed(); // await contract to be deployed
    console.log('CookBook contract deployed to the address %s ', cookBookInstance.address);

    // Mint cookbook (token)
    await cookBookInstance.mint(
        MASTER.address,         // address that will receive the token
        1,                      // amount of tokens to mint
        { value: pricePerMint } // price per token
    );

    const MASTER_BOOK_ID = 1;
    const ALICE_BOOK_ID = 2;
    let actual_recipe_id = 1;

    const INITIAL_recipeS = 3;

    console.log("Create recipes for Master's book");
    let allAddingTxs = [];
    for (let i = 0; i < INITIAL_recipeS; i++) {
        allAddingTxs.push(
            await cookBookInstance.addAssetEntry(   // add a new asset to the collection (not binded to any token)
                `ipsf://metadata/master_recipe_${i + actual_recipe_id}`,  // metadata URI of the asset
            ),
        );
    }
    await Promise.all(allAddingTxs.map((addingTx) => addingTx.wait()));

    console.log("Add recipes to Master's book");
    for (let i = 0; i < INITIAL_recipeS; i++) {
        const recipe_ID = actual_recipe_id;
        actual_recipe_id++;    // Update to the next ID
        await cookBookInstance.addAssetToToken(
            MASTER_BOOK_ID, // ID of the token that will receive the asset
            recipe_ID,     // ID of the asset to add
            0               // ID of the asset to replace with the new one. 0 == none
        );
    }

    console.log(
        "Added %d recipes to the %s Master's book", INITIAL_recipeS,   // amount of recipes to add
        await cookBookInstance.name(),  // name of the NFT collection
    );
    let activeMasterBookRecipes = await cookBookInstance.getActiveAssets(MASTER_BOOK_ID);
    console.log('Recipes active: %s', activeMasterBookRecipes);

    console.log("Adding Alice as a new contributor for the collection");
    await cookBookInstance.connect(MASTER).addContributor(ALICE.address);

    // Alice mint her cookbook
    await cookBookInstance.connect(ALICE).mint(
        ALICE.address,          // address that will receive the token
        1,                      // amount of tokens to mint
        { value: pricePerMint } // price per token
    );

    const INITIAL_ALICE_recipeS = 2;
    for (let i = 0; i < INITIAL_ALICE_recipeS; i++) {
        const recipe_ID = actual_recipe_id;
        actual_recipe_id++;     // Update to the next ID
        await cookBookInstance
            .connect(ALICE)
            .addAssetEntry(     // add a new asset to the collection (not binded to any token)
                `ipsf://metadata/alice_recipe_${recipe_ID}`     // metadata URI of the asset
            );
        await cookBookInstance.
            connect(ALICE).
            addAssetToToken(
                ALICE_BOOK_ID,  // ID of the token that will receive the asset
                recipe_ID,      // ID of the asset to add
                0               // ID of the asset to replace with the new one. 0 == none
            );
    }

    const activePages = await cookBookInstance.getActiveAssets(ALICE_BOOK_ID);
    console.log('Active recipes to %d book %s', ALICE_BOOK_ID, activePages);

    // Master creates a new recipe and send it to Alice cookbook
    await cookBookInstance
        .connect(MASTER)
        .addAssetEntry(     // add a new asset to the collection (not binded to any token)
            `ipsf://metadata/master_recipe_${actual_recipe_id}`   // metadata URI of the asset
        );
    await cookBookInstance
        .connect(MASTER).
        addAssetToToken(
            ALICE_BOOK_ID,      // ID of the token that will receive the asset
            actual_recipe_id,   // ID of the asset to add
            0                   // ID of the asset to replace with the new one. 0 == none
        );
    actual_recipe_id++;    // Update to the next ID

    console.log("Alice book recipes: %s", await cookBookInstance.getActiveAssets(ALICE_BOOK_ID));

    // Alice accepts the recipe from Master
    let alicePendingAssets = await cookBookInstance.getPendingAssets(ALICE_BOOK_ID);
    await cookBookInstance
        .connect(ALICE)
        .acceptAsset(
            ALICE_BOOK_ID,                  // ID of the token that will receive the asset
            alicePendingAssets.length - 1,  // Index of the asset to add in the pending array
            actual_recipe_id - 1            // ID of the asset to add
        );

    console.log(
        'Alice cookbook recipes after accepting the Master recipe %s\n',
        await cookBookInstance.getActiveAssets(ALICE_BOOK_ID),
    );

    // Alice creates a recipe and replace the latest added with it
    await cookBookInstance
        .connect(ALICE)
        .addAssetEntry(     // add a new asset to the collection (not binded to any token)
            `ipsf://metadata/alice_recipe_${actual_recipe_id}`    // metadata URI of the asset
        );

    const WRONG_RECIPE_ID = actual_recipe_id - 1;
    const FIXED_RECIPE_ID = actual_recipe_id;
    console.log("Replace %d with %d", WRONG_RECIPE_ID, FIXED_RECIPE_ID);
    await cookBookInstance
        .connect(ALICE)
        .addAssetToToken(
            ALICE_BOOK_ID,      // ID of the token that will receive the asset
            FIXED_RECIPE_ID,    // ID of the asset to add
            WRONG_RECIPE_ID     // ID of the asset to replace with the new one
        );
    actual_recipe_id++;    // Update to the next ID

    console.log(
        'Alice cookbook recipes recipes after replacement: %s',
        await cookBookInstance.getActiveAssets(ALICE_BOOK_ID),
    );

    // Master creates 2 recipes and add them to Alice cookbook
    for (let i = 0; i < 2; i++) {
        await cookBookInstance
            .connect(MASTER)
            .addAssetEntry(     // add a new asset to the collection (not binded to any token)
                `ipsf://metadata/master_recipe_${actual_recipe_id}`   // metadata URI of the asset
            );
        await cookBookInstance.addAssetToToken(
            ALICE_BOOK_ID,      // ID of the token that will receive the asset
            actual_recipe_id,  // ID of the asset to add
            0                   // ID of the asset to replace with the new one. 0 == none
        );
        actual_recipe_id++;
    }

    // Alice accepts recipes
    for (let i = 0; i < 2; i++) {
        const CURRENT_recipe_ID = actual_recipe_id - 2 + i;
        let acceptTx = await cookBookInstance
            .connect(ALICE)
            .acceptAsset(           // accept pending asset
                ALICE_BOOK_ID,      // ID of the token that will receive the asset
                0,                  // Index of the asset in the pending array
                CURRENT_recipe_ID  // ID of the asset to add
            );
        acceptTx.wait();
    }

    // TEST TEST TEST
    await cookBookInstance.connect(ALICE)
        .addAssetToToken(ALICE_BOOK_ID, 1, 0);

    console.log(await cookBookInstance.getActiveAssets(ALICE_BOOK_ID));

    //await cookBookInstance.connect(MASTER).addContributor(ALICE.address);

    // END TEST

    console.log(
        'Alice cookbook after accepting the new recipes: %s',
        await cookBookInstance.getActiveAssets(ALICE_BOOK_ID),
    );

    // Master burns his cookbook

    console.log(
        'Master is going to burn his cookbook with %d recipes!',
        (await cookBookInstance.getActiveAssets(MASTER_BOOK_ID)).length,
    );
    await cookBookInstance.connect(MASTER).
        burn(MASTER_BOOK_ID // ID of the token to burn
        );
    console.log(
        'Burned...\nCookbooks owned by MASTER: %d',
        await cookBookInstance.balanceOf(MASTER.address),
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});