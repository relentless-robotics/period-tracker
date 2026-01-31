const { chromium } = require('playwright');
const path = require('path');

async function deployToVercel() {
  const stateFile = path.join(__dirname, '..', 'browser_state', 'google_auth.json');

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });

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
    // Go to Vercel and import from GitHub
    console.log('Navigating to Vercel...');
    await page.goto('https://vercel.com/new', { waitUntil: 'networkidle' });

    // Wait a bit for any redirects
    await page.waitForTimeout(3000);

    // Check if we need to login
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      console.log('Need to login - clicking Continue with Google...');
      await page.click('button:has-text("Continue with Google")');
      await page.waitForTimeout(5000);
    }

    // Now we should be on the import page
    console.log('Looking for GitHub import option...');
    await page.waitForTimeout(3000);

    // Try to find and click the period-tracker repo
    const repoLink = await page.locator('text=period-tracker').first();
    if (await repoLink.count() > 0) {
      console.log('Found period-tracker repo, clicking import...');
      await repoLink.click();
    } else {
      console.log('Repo not visible, may need to connect GitHub or search...');
      // Try to search for it
      const searchBox = await page.locator('input[placeholder*="Search"]').first();
      if (await searchBox.count() > 0) {
        await searchBox.fill('period-tracker');
        await page.waitForTimeout(2000);
        await page.locator('text=period-tracker').first().click();
      }
    }

    await page.waitForTimeout(3000);

    // Click Deploy button
    console.log('Clicking Deploy...');
    const deployButton = await page.locator('button:has-text("Deploy")').first();
    if (await deployButton.count() > 0) {
      await deployButton.click();
      console.log('Deployment started!');

      // Wait for deployment to complete (up to 5 minutes)
      console.log('Waiting for deployment to complete...');
      await page.waitForSelector('text=Congratulations', { timeout: 300000 });

      // Get the deployment URL
      const urlElement = await page.locator('a[href^="https://period-tracker"]').first();
      const deploymentUrl = await urlElement.getAttribute('href');
      console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
      console.log(`URL: ${deploymentUrl}`);

      return deploymentUrl;
    } else {
      console.log('Could not find Deploy button. Taking screenshot...');
      await page.screenshot({ path: 'vercel-deploy-debug.png' });
      throw new Error('Deploy button not found');
    }

  } catch (error) {
    console.error('Error during deployment:', error);
    await page.screenshot({ path: 'vercel-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

deployToVercel()
  .then(url => {
    console.log('\nDeployment URL:', url);
    process.exit(0);
  })
  .catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
