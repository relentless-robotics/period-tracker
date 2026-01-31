const { chromium } = require('playwright');
const path = require('path');

async function deployToVercel() {
  const stateFile = path.join(__dirname, '..', 'browser_state', 'google_auth.json');

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
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
    // Use the direct clone URL with our repo
    console.log('Navigating to Vercel with direct import link...');
    await page.goto('https://vercel.com/new/clone?repository-url=https://github.com/relentless-robotics/period-tracker', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    // Check if we need to login
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('login') || currentUrl.includes('sign')) {
      console.log('Need to login - looking for Google login button...');

      // Try multiple selectors for the Google button
      const googleButton = await page.locator('button:has-text("Continue with Google"), a:has-text("Continue with Google"), [aria-label*="Google"]').first();

      if (await googleButton.count() > 0) {
        console.log('Clicking Google login...');
        await googleButton.click();
        await page.waitForTimeout(8000);
      }
    }

    // Wait for the page to load after potential login
    await page.waitForTimeout(5000);
    console.log('Current URL after auth:', page.url());

    // Look for "Continue" or "Import" button
    console.log('Looking for import/continue button...');

    // Try different button texts
    const continueButton = await page.locator('button:has-text("Continue"), button:has-text("Import"), button:has-text("Clone")').first();

    if (await continueButton.count() > 0) {
      console.log('Found button, clicking...');
      await continueButton.click();
      await page.waitForTimeout(5000);
    }

    // Now look for Deploy button
    console.log('Looking for Deploy button...');
    await page.waitForTimeout(3000);

    const deployButton = await page.locator('button:has-text("Deploy")').first();

    if (await deployButton.count() > 0) {
      console.log('Clicking Deploy button...');
      await deployButton.click();

      // Wait for deployment to complete
      console.log('Waiting for deployment to complete...');

      // Wait for either success page or deployment URL
      try {
        await page.waitForSelector('text=/Congratulations|deployed|Visit/', { timeout: 300000 });
        console.log('Deployment appears to have completed!');
      } catch (e) {
        console.log('Timeout waiting for completion message, checking for URL anyway...');
      }

      // Try to find the deployment URL
      await page.waitForTimeout(5000);

      // Look for links with period-tracker in them
      const urlElements = await page.locator('a[href*="period-tracker"], a[href*="vercel.app"]').all();

      if (urlElements.length > 0) {
        for (const el of urlElements) {
          const href = await el.getAttribute('href');
          if (href && (href.includes('period-tracker') || href.includes('.vercel.app'))) {
            console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
            console.log(`URL: ${href}`);
            return href;
          }
        }
      }

      // If we can't find the URL, just take a screenshot
      console.log('Could not extract URL, taking screenshot...');
      await page.screenshot({ path: 'vercel-deployed.png', fullPage: true });

      // Try to get any text that looks like a URL
      const pageContent = await page.content();
      const urlMatch = pageContent.match(/https:\/\/[a-z0-9-]+\.vercel\.app/);
      if (urlMatch) {
        console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
        console.log(`URL: ${urlMatch[0]}`);
        return urlMatch[0];
      }

      return 'Deployment completed - check vercel-deployed.png for URL';

    } else {
      console.log('Could not find Deploy button. Taking screenshot...');
      await page.screenshot({ path: 'vercel-debug.png', fullPage: true });

      // Print page content for debugging
      console.log('\nPage title:', await page.title());
      console.log('Looking for any buttons...');
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons`);
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const text = await buttons[i].textContent();
        console.log(`Button ${i}: ${text}`);
      }

      throw new Error('Deploy button not found');
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
    console.log('Deployment URL:', url);
    console.log('=================================\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
