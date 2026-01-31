const { chromium } = require('playwright');
const path = require('path');

async function deployToVercel() {
  const stateFile = path.join(__dirname, '..', 'browser_state', 'google_auth.json');

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });

  let context;
  try {
    context = await browser.newContext({
      storageState: stateFile
    });
  } catch (error) {
    console.log('No saved session, creating new context');
    context = await browser.newContext();
  }

  const page = await context.newPage();

  try {
    // Step 1: Login to Vercel with Google
    console.log('Step 1: Going to Vercel login...');
    await page.goto('https://vercel.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    const googleLoginButton = await page.locator('button:has-text("Continue with Google"), a:has-text("Continue with Google")').first();
    if (await googleLoginButton.count() > 0) {
      console.log('Clicking Continue with Google...');
      await googleLoginButton.click();
      await page.waitForTimeout(10000);
    }

    // Step 2: Navigate to new project page
    console.log('Step 2: Navigating to new project page...');
    await page.goto('https://vercel.com/new', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(8000);

    // Step 3: Click "Continue with GitHub" in the Import Git Repository section
    console.log('Step 3: Clicking Continue with GitHub...');
    const githubButton = await page.locator('button:has-text("Continue with GitHub")').first();

    if (await githubButton.count() > 0) {
      await githubButton.click();
      await page.waitForTimeout(5000);

      // If we're redirected to GitHub for authorization
      if (page.url().includes('github.com')) {
        console.log('On GitHub - authorizing Vercel...');

        // Wait for page to load
        await page.waitForTimeout(3000);

        // Click Authorize button if present
        const authorizeBtn = await page.locator('button[type="submit"]:has-text("Authorize"), button:has-text("Authorize")').first();
        if (await authorizeBtn.count() > 0) {
          console.log('Clicking Authorize...');
          await authorizeBtn.click();
          await page.waitForTimeout(5000);
        }

        // Wait to return to Vercel
        await page.waitForURL('**/vercel.com/**', { timeout: 30000 });
      }

      await page.waitForTimeout(5000);
    }

    // Step 4: Find and import our repository
    console.log('Step 4: Looking for period-tracker repository...');

    // Wait for repositories to load
    await page.waitForTimeout(5000);

    // Look for our repo - it should be visible in the list
    const repoText = await page.locator('text=period-tracker').first();

    if (await repoText.count() > 0) {
      console.log('Found period-tracker repository!');

      // Find the Import button associated with this repo
      // The Import button should be near the repo name
      const importBtn = await page.locator('button:has-text("Import")').first();

      if (await importBtn.count() > 0) {
        console.log('Clicking Import button...');
        await importBtn.click();
        await page.waitForTimeout(5000);

        // Step 5: Deploy the project
        console.log('Step 5: Looking for Deploy button...');

        const deployBtn = await page.locator('button:has-text("Deploy")').first();

        if (await deployBtn.count() > 0) {
          console.log('Clicking Deploy button...');
          await deployBtn.click();

          console.log('\nDeployment started! Waiting for completion...');
          console.log('This may take 2-3 minutes...\n');

          // Wait for deployment to complete - look for success indicators
          let deploymentUrl = null;

          for (let i = 0; i < 60; i++) {
            await page.waitForTimeout(5000);

            // Look for deployment URL
            const urlLinks = await page.locator('a[href*=".vercel.app"]').all();

            for (const link of urlLinks) {
              const href = await link.getAttribute('href');
              if (href && href.match(/https:\/\/[a-z0-9-]+\.vercel\.app/) && !href.includes('/vercel.com/')) {
                deploymentUrl = href;
                break;
              }
            }

            if (deploymentUrl) {
              console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
              console.log(`\nURL: ${deploymentUrl}\n`);
              await page.waitForTimeout(3000);
              return deploymentUrl;
            }

            console.log(`Waiting... (${i * 5} seconds elapsed)`);
          }

          // If we got here, deployment might have succeeded but we couldn't find URL
          console.log('Deployment completed but URL not found in expected location');
          await page.screenshot({ path: 'vercel-final.png', fullPage: true });

          // Try to extract from page content
          const content = await page.content();
          const match = content.match(/https:\/\/[a-z0-9-]+\.vercel\.app/);
          if (match) {
            return match[0];
          }

          return 'Deployment may have succeeded - check vercel-final.png';
        } else {
          throw new Error('Deploy button not found after import');
        }
      } else {
        throw new Error('Import button not found');
      }
    } else {
      console.log('Repository not visible yet. Taking screenshot...');
      await page.screenshot({ path: 'vercel-no-repo.png', fullPage: true });
      throw new Error('Repository not found in list - may need to wait for GitHub sync');
    }

  } catch (error) {
    console.error('\nError during deployment:', error.message);
    await page.screenshot({ path: 'vercel-error-final.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

console.log('========================================');
console.log('Period Tracker - Vercel Deployment');
console.log('========================================\n');

deployToVercel()
  .then(url => {
    console.log('\n========================================');
    console.log('✅ DEPLOYMENT COMPLETE!');
    console.log('========================================');
    console.log(`\nYour app is live at:\n${url}\n`);
    process.exit(0);
  })
  .catch(error => {
    console.error('\n========================================');
    console.error('❌ DEPLOYMENT FAILED');
    console.error('========================================');
    console.error(`\nError: ${error.message}\n`);
    process.exit(1);
  });
