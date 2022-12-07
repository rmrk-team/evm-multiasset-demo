# EVM Multi-Asset Demo

### A contextualized user journey to explore and understand the Multi-Asset NFT features

Multi-Asset (MA) is a Solidity smart contract implementation by [RMRK Team](https://github.com/rmrk-team) that allows to bind assets (PDF, MP3, video files etc...) to an NFT. In this journey we will explore the main features of [RMRK MultiAsset](https://github.com/rmrk-team/evm/blob/dev/contracts/implementations/RMRKMultiAssetImpl.sol).

##### The use cases that will be explored are:

- Creation of an NFT collection that supports asset binding
- Creation of assets to addition to the NFTs of the collection
- Asset replacement
- NFT burning (with relative binded assets)

## User journey context

To better understand the different use cases of this standard we will transform them in situation where dynamics are clear because we are already familiar with them, but every action will be performed with smart contract functions with the help of some Typescript code :muscle:

_We have 2 expert cookers, **Master** and his student **Alice**, that are travelling the world with the aim of create new innovative recipes. Both want to create a cookbook with the best exclusive contents and be remembered as great cooker in the kitchen history._

## Cookbook crafting - Creation of an NFT collection with Multi-Asset support

After the travel started Master and Alice decided to separate and they taken 2 different ways. Master **crafted** his cookbook in Japan, ancient place rich of tradition and history.

```typescript
// Mint cookbook (token)
    await cookBookInstance.mint(
        MASTER.address,         // address that will receive the token
        1,                      // amount of tokens to mint
        { value: pricePerMint } // price per token
    );
```
## recipes creation - Creation of assets to add to the collection tokens

During his stay Master studied a lot and after getting the inspiration  he **gave life** to 3 raw recipes.

```typescript
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
```

The recipes were not good enough, so, after a perfectioning period and some adjustments Master **added** them to his cookbook.

```typescript
console.log("Add recipes to Master's book");
    for (let i = 0; i < INITIAL_recipeS; i++) {
        const recipe_ID = actual_recipe_id;
        actual_recipe_id++;    // Update to the next ID
        await cookBookInstance.addAssetToToken(
            MASTER_BOOK_ID, // ID of the token that will receive the asset
            recipe_ID,     // ID of the asset to add
            0               // ID of the asset to replace with the new one. 0 == none
        );console.log("Add recipes to Master's book");
    for (let i = 0; i < INITIAL_recipeS; i++) {
        const recipe_ID = actual_recipe_id;
        actual_recipe_id++;    // Update to the next ID
        await cookBookInstance.addAssetToToken(
            MASTER_BOOK_ID, // ID of the token that will receive the asset
            recipe_ID,     // ID of the asset to add
            0               // ID of the asset to replace with the new one. 0 == none
        );                  // direct addition since the adder is the owner
    }
    }
```

Also Alice crafted her cookbook, but she did it in Argentina.

```typescript
// Alice mint her cookbook
    await cookBookInstance.connect(ALICE).mint(
        ALICE.address,          // address that will receive the token
        1,                      // amount of tokens to mint
        { value: pricePerMint } // price per token
    );
```

She was inspired by different tastes and she created 2 recipes adding them **directly** to the cookbook.

```typescript
const INITIAL_ALICE_recipeS = 2;
    for (let i = 0; i < INITIAL_ALICE_recipeS; i++) {
        const recipe_ID = actual_recipe_id;
        actual_recipe_id++;    // Update to the next ID
        await cookBookInstance
            .connect(ALICE)
            .addAssetEntry(     // add a new asset to the collection (not binded to any token)
                `ipsf://metadata/master_recipe_${recipe_ID}`  // metadata URI of the asset
            );
        await cookBookInstance.
            connect(ALICE).
            addAssetToToken(
                ALICE_BOOK_ID,  // ID of the token that will receive the asset
                recipe_ID,     // ID of the asset to add
                0               // ID of the asset to replace with the new one. 0 == none
            );
    }
```

## recipe improvement - Asset replacement

During his travel Master created a recipe dedicated to his student and he decided to **send** it to Alice, to add it to her cookbook.

```Typescript
// Master creates a new recipe and Alice adds it to her cookbook
    await cookBookInstance
        .connect(MASTER)
        .addAssetEntry(     // add a new asset to the collection (not binded to any token)
            `ipsf://metadata/master_recipe_${actual_recipe_id}`   // metadata URI of the asset
        );
```

Alice **accepted** suddently the recipe gifted from her master...

```Typescript
await cookBookInstance.connect(ALICE).
        addAssetToToken(
            ALICE_BOOK_ID,      // ID of the token that will receive the asset
            actual_recipe_id,  // ID of the asset to add
            0                   // ID of the asset to replace with the new one. 0 == none
        );
    actual_recipe_id++;    // Update to the next ID
```

...but she discovered that the recipe was missing something. :confused:
After a long searching process and many attempts she found the right missing ingredient.
So Alice fixed the recipe and she replaced the old one with this new improved one. :pencil:

```Typescript
// Alice creates a recipe and replace the latest added with it
    await cookBookInstance
        .connect(ALICE)
        .addAssetEntry(     // add a new asset to the collection (not binded to any token)
            `ipsf://metadata/alice_recipe_${actual_recipe_id}`    // metadata URI of the asset
        );
    const recipe_TO_REPLACE = 6;
    await cookBookInstance
        .connect(ALICE)
        .addAssetToToken(
            ALICE_BOOK_ID,      // ID of the token that will receive the asset
            actual_recipe_id,  // ID of the asset to add
            recipe_TO_REPLACE  // ID of the asset to replace with the new one
        );
    actual_recipe_id++;    // Update to the next ID
```

After this fix alice's career took flight and Master, proud of his student, proposed her to create 2 recipes as a collaboration to add her cookbook. 

```Typescript
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
```

After a small review Alice added them to her book. :book:

```Typescript
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
```

## Master retires and burn his cookbook - Token burning with related assets

After this final collaboration with Alice Master decided to retire, he was an old man and he was also a little tired of travelling the world. This final decision took him to burn his cookbook. :fire:
He wanted to leave only a nice memory of him, and a veil of mystery around his cooking figure :wave:

```Typescript
await cookBookInstance.connect(MASTER).
        burn(MASTER_BOOK_ID // ID of the token to burn
        );
```

## User journey summary 

In this tutorial we have seen how to interact with the Multi-Asset implementation in order to:

1. :point_right: **Create a collection** with tokens that support this standard
2. :point_right: **Create assets** (resources) that can be added to a token
3. :point_right: **Replace** an active asset with another one
4. :point_right: **Burn** a token with all its assets binded

## Development notes :warning:

In this implementation the assets cannot be unbinded from a token. Once I add the asset with ID 5 to the token with ID 1 there is no way to remove the asset so keep attention while accepting new asset from unknown origins.
On the other hand an asset can be "*deleted*" by replacing it with a new one, but the number of active assets will remain the same.

## Bugs, doubts and help :pray:

For clarifications, bug reporting or help please open a Github issue or write a message here:
- **Telegram**: https://t.me/rmrkimpl