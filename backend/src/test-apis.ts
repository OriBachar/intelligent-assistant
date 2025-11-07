/**
 * Test script to inspect actual API responses
 * Run with: npm run test-apis
 * or: ts-node src/test-apis.ts
 */

import 'dotenv/config';
import * as igdbService from './services/games/igdbService';

const testIgdb = async () => {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('TESTING IGDB API');
    console.log('═══════════════════════════════════════════════════════════\n');

    try {
        // Test 1: Try getting companies without search first (to verify endpoint works)
        console.log('1. Testing companies endpoint without search (limit 5)...');
        let companies = await igdbService.getDevelopers(undefined, { limit: 5 });
        console.log('   Found companies:', companies.length);
        if (companies.length > 0) {
            console.log('   Sample company:', JSON.stringify(companies[0], null, 2));
        }
        
        // Test 2: Try searching with where clause instead
        console.log('\n2. Trying search with where clause for "CD Projekt Red"...');
        // We'll need to modify the service to support this, but first let's try the search again
        companies = await igdbService.getDevelopers('CD Projekt Red');
        console.log('   Found companies:', companies.length);
        
        if (companies.length === 0) {
            console.log('\n   Trying "CD Projekt"...');
            companies = await igdbService.getDevelopers('CD Projekt');
            console.log('   Found companies:', companies.length);
        }
        
        if (companies.length === 0) {
            console.log('\n   Trying "Naughty Dog" (known developer)...');
            companies = await igdbService.getDevelopers('Naughty Dog');
            console.log('   Found companies:', companies.length);
        }
        
        // Test 3: Try getting CD Projekt Red by known ID (20878)
        if (companies.length === 0) {
            console.log('\n3. Trying to get CD Projekt Red by known ID (20878)...');
            const companyById = await igdbService.getCompanyById(20878);
            if (companyById) {
                console.log('   Found company by ID:', JSON.stringify(companyById, null, 2));
                companies = [companyById];
            } else {
                console.log('   Company not found by ID');
            }
        }
        
        if (companies.length > 0) {
            console.log('\n   First company:', JSON.stringify(companies[0], null, 2));
            console.log('   Company keys:', Object.keys(companies[0]));
            
            const companyId = companies[0].id;
            console.log(`\n2. Getting company details for ID ${companyId}...`);
            const companyDetails = await igdbService.getCompanyById(companyId);
            console.log('   Company details:', JSON.stringify(companyDetails, null, 2));
            
            console.log(`\n3. Getting games developed by company ID ${companyId}...`);
            console.log(`   Query will be: fields id,name,slug,summary,rating,first_release_date,platforms,genres,cover; where involved_companies.company = ${companyId} & involved_companies.developer = true; limit 5;`);
            const games = await igdbService.getGamesByDeveloper(companyId, { limit: 5 });
            console.log('   Found games:', games.length);
            if (games.length > 0) {
                console.log('   First game:', JSON.stringify(games[0], null, 2));
                console.log('   First game keys:', Object.keys(games[0]));
                console.log('\n   All game names:');
                games.forEach((game, index) => {
                    console.log(`   ${index + 1}. ${game.name || 'NO NAME'} (ID: ${game.id})`);
                });
            }
        } else {
            console.log('\n   ⚠️ No companies found with any search term. This might indicate:');
            console.log('   - Search syntax issue');
            console.log('   - API permissions/rate limiting');
            console.log('   - Need to try different search approach');
        }
    } catch (error) {
        console.error('   ERROR:', error);
    }
};

const main = async () => {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║           IGDB API Testing Script                        ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    
    // Test IGDB only
    await testIgdb();
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('Testing complete!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    process.exit(0);
};

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

