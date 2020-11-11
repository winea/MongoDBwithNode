const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const circulationRepo = require('./repos/circulationRepo');
//data json
const data = require('./circulation.json');

const url = 'mongodb://localhost:27017';
const dbName = 'circulation';

async function main() {
    const client = new MongoClient(url, {useUnifiedTopology: true});

    await client.connect();

    try {
        const results = await circulationRepo.loadData(data);
        //console.log(results.insertedCount, results.ops);
        const getData = await circulationRepo.get();
        //ter certeza que a quantidade de dados inseridos e a mesma
        assert.strictEqual(data.length, results.insertedCount);
        //filter   
        const filterData = await circulationRepo.get({ Newspaper: getData[4].Newspaper });
        assert.deepStrictEqual(filterData[0], getData[4]);
    
        const limitData = await circulationRepo.get({}, 3);
        assert.strictEqual(limitData.length, 3);
        //preciso de string
        const id = getData[4]._id.toString();
        const byId = await circulationRepo.getById(id);
        assert.deepStrictEqual(byId, getData[4])

        //add item
        const newItem = {
            "Newspaper": "My paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
          }
          const addedItem = await circulationRepo.add(newItem);
          assert(addedItem._id)
          const addedItemQuery = await circulationRepo.getById(addedItem._id);
          assert.deepStrictEqual(addedItemQuery, newItem)

        //update
          const updatedItem = await circulationRepo.update(addedItem._id, {
            "Newspaper": "My new paper",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 100,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 0,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 0,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 0
          });
          assert.strictEqual(updatedItem.Newspaper, "My new paper");
      
      
          const newAddedItemQuery = await circulationRepo.getById(addedItem._id);
          assert.strictEqual(newAddedItemQuery.Newspaper, "My new paper");
      
          //remove
          const removed = await circulationRepo.remove(addedItem._id);
          assert(removed);
          const deletedItem = await circulationRepo.getById(addedItem._id);
          assert.strictEqual(deletedItem, null);

          //media
          const avgFinalists = await circulationRepo.averageFinalists();
          console.log("Average Finalists: " + avgFinalists);
          
          const avgByChange = await circulationRepo.averageFinalistsByChange();
          console.log(avgByChange);
        
    } catch (error) {
        console.log(error);
    } finally {
        const admin = client.db(dbName).admin();
        //console.log(await admin.serverStatus());
        //console.log(await admin.listDatabases());
        await client.db(dbName).dropDatabase();
        //fechar conexao
        client.close();
    }

       
   
    
}

main();