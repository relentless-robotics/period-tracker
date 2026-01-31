const { chromium } = require('playwright');
const path = require('path');

async function deployToVercel() {
  const stateFile = path.join(__dirname, '..', 'browser_state', 'google_auth.json');

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
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
    // First, go to Vercel and make sure we're logged in
    console.log('Going to Vercel...');
    await page.goto('https://vercel.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Check if we need to login
    if (page.url().includes('login')) {
      console.log('Logging in with Google...');
      await page.click('button:has-text("Continue with Google")');
      await page.waitForTimeout(8000);
    }

    // Now go to import from GitHub
    console.log('Navigating to import page...');
    await page.goto('https://vercel.com/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // Click "Continue with GitHub"
    console.log('Connecting GitHub...');
    const githubButton = await page.locator('button:has-text("Continue with GitHub")').first();

    if (await githubButton.count() > 0) {
      await githubButton.click();
      await page.waitForTimeout(5000);

      // Handle GitHub OAuth if needed
      if (page.url().includes('github.com')) {
        console.log('On GitHub authorization page...');

        // Check if we need to authorize
        const authorizeButton = await page.locator('button:has-text("Authorize"), button[type="submit"]').first();
        if (await authorizeButton.count() > 0) {
          console.log('Authorizing Vercel to access GitHub...');
          await authorizeButton.click();
          await page.waitForTimeout(5000);
        }
      }

      // Wait to get back to Vercel
      await page.waitForURL('**/vercel.com/**', { timeout: 30000 });
      await page.waitForTimeout(3000);
    }

    // Now we should be able to see repositories
    console.log('Looking for period-tracker repository...');
    await page.waitForTimeout(3000);

    // Search for the repo
    const searchBox = await page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchBox.count() > 0) {
      console.log('Searching for period-tracker...');
      await searchBox.fill('period-tracker');
      await page.waitForTimeout(2000);
    }

    // Look for the import/select button for our repo
    const repoCard = await page.locator('text=period-tracker').first();
    if (await repoCard.count() > 0) {
      console.log('Found repository, looking for Import button...');

      // Find the Import button near the repo name
      const importButton = await page.locator('button:has-text("Import")').first();
      if (await importButton.count() > 0) {
        console.log('Clicking Import...');
        await importButton.click();
        await page.waitForTimeout(5000);

        // Now look for Deploy button
        console.log('Looking for Deploy button...');
        const deployButton = await page.locator('button:has-text("Deploy")').first();

        if (await deployButton.count() > 0) {
          console.log('Clicking Deploy...');
          await deployButton.click();

          // Wait for deployment
          console.log('Deployment started! Waiting for completion (may take 2-3 minutes)...');

          try {
            // Wait for success indicators
            await page.waitForSelector('text=/Congratulations|Building|deployed/i', { timeout: 300000 });
            console.log('Deployment progress detected...');

            // Wait a bit more for the URL to appear
            await page.waitForTimeout(10000);

            // Extract the deployment URL
            const urlElements = await page.locator('a[href*=".vercel.app"]').all();

            for (const el of urlElements) {
              const href = await el.getAttribute('href');
              if (href && href.includes('.vercel.app') && !href.includes('vercel.com')) {
                console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
                console.log(`URL: ${href}`);
                await page.waitForTimeout(3000);
                return href;
              }
            }

            // Fallback: try to find URL in page content
            const content = await page.content();
            const urlMatch = content.match(/https:\/\/[a-z0-9-]+\.vercel\.app/);
            if (urlMatch) {
              console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
              console.log(`URL: ${urlMatch[0]}`);
              return urlMatch[0];
            }

            console.log('Deployment completed but could not extract URL');
            await page.screenshot({ path: 'vercel-success.png', fullPage: true });
            return 'Deployment successful - check vercel-success.png';

          } catch (e) {
            console.log('Deployment may still be in progress...');
            await page.screenshot({ path: 'vercel-deploying.png', fullPage: true });
            throw new Error('Deployment timeout or error');
          }
        }
      }
    } else {
      console.log('Repository not found. Taking screenshot...');
      await page.screenshot({ path: 'vercel-repos.png', fullPage: true });
      throw new Error('Repository not found in list');
    }

  } catch (error) {
    console.error('Error during deployment:', error);
    await page.screenshot({ path: 'vercel-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

deployToVercel()
  .then(url => {
    console.log('\n=================================');
    console.log('DEPLOYMENT URL:', url);
    console.log('=================================\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nDeployment failed:', error.message);
    process.exit(1);
  });
