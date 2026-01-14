/**
 * Script to fetch Asana tag GIDs
 * Run with: node scripts/get-asana-tags.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });

const ASANA_API_URL = 'https://app.asana.com/api/1.0';

async function getAsanaTags() {
  const token = process.env.ASANA_ACCESS_TOKEN;
  const workspaceId = process.env.ASANA_WORKSPACE_ID;

  if (!token || !workspaceId) {
    console.error(
      'Error: ASANA_ACCESS_TOKEN and ASANA_WORKSPACE_ID must be set in .env.local'
    );
    process.exit(1);
  }

  try {
    console.log('Fetching tags from Asana workspace...\n');

    const response = await fetch(`${ASANA_API_URL}/workspaces/${workspaceId}/tags`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} ${response.statusText}`);
      console.error(errorText);
      process.exit(1);
    }

    const result = await response.json();
    const tags = result.data || [];

    console.log('Available tags in Asana:');
    console.log('========================\n');

    const targetTags = ['Call Needed', 'Rush', 'Needs Creative'];
    const foundTags = {};

    for (const tag of tags) {
      console.log(`Name: ${tag.name}`);
      console.log(`GID:  ${tag.gid}\n`);

      if (targetTags.includes(tag.name)) {
        foundTags[tag.name] = tag.gid;
      }
    }

    console.log('\n\nEnvironment Variables to Add:');
    console.log('==============================\n');

    if (foundTags['Call Needed']) {
      console.log(`ASANA_TAG_CALL_NEEDED=${foundTags['Call Needed']}`);
    } else {
      console.log('# ASANA_TAG_CALL_NEEDED=<not found - create tag in Asana>');
    }

    if (foundTags['Rush']) {
      console.log(`ASANA_TAG_RUSH=${foundTags['Rush']}`);
    } else {
      console.log('# ASANA_TAG_RUSH=<not found - create tag in Asana>');
    }

    if (foundTags['Needs Creative']) {
      console.log(`ASANA_TAG_NEEDS_CREATIVE=${foundTags['Needs Creative']}`);
    } else {
      console.log('# ASANA_TAG_NEEDS_CREATIVE=<not found - create tag in Asana>');
    }

    console.log(
      '\n\nCopy the lines above and add them to your .env.local file under the Asana section.\n'
    );
  } catch (error) {
    console.error('Error fetching tags:', error.message);
    process.exit(1);
  }
}

getAsanaTags();
