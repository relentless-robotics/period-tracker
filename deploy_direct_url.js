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
    await page.waitForTimeout(5000);

    // Step 3: Use the direct Git URL input method
    console.log('Step 3: Entering GitHub repository URL directly...');

    // Find the input field that says "Enter a Git repository URL to deploy..."
    const urlInput = await page.locator('input[placeholder*="Git repository URL"]').first();

    if (await urlInput.count() > 0) {
      console.log('Found URL input field...');
      await urlInput.click();
      await urlInput.fill('https://github.com/relentless-robotics/period-tracker');
      await page.waitForTimeout(2000);

      // Click the Continue button
      const continueBtn = await page.locator('button:has-text("Continue")').first();
      if (await continueBtn.count() > 0) {
        console.log('Clicking Continue...');
        await continueBtn.click();
        await page.waitForTimeout(8000);

        // We may need to connect GitHub at this point
        const connectGithubBtn = await page.locator('button:has-text("Continue with GitHub")').first();
        if (await connectGithubBtn.count() > 0) {
          console.log('Need to connect GitHub first...');
          await connectGithubBtn.click();
          await page.waitForTimeout(5000);

          // Handle GitHub OAuth
          if (page.url().includes('github.com')) {
            console.log('On GitHub authorization page...');
            await page.waitForTimeout(3000);

            // Click Authorize
            const authorizeBtn = await page.locator('button[type="submit"], button:has-text("Authorize")').first();
            if (await authorizeBtn.count() > 0) {
              console.log('Authorizing Vercel...');
              await authorizeBtn.click();
              await page.waitForTimeout(5000);
            }

            // Wait to return
            await page.waitForURL('**/vercel.com/**', { timeout: 30000 });
            await page.waitForTimeout(5000);

            // Try clicking Continue again
            const continueBtn2 = await page.locator('button:has-text("Continue")').first();
            if (await continueBtn2.count() > 0) {
              await continueBtn2.click();
              await page.waitForTimeout(5000);
            }
          }
        }

        // Step 4: Look for Deploy button
        console.log('Step 4: Looking for Deploy button...');
        await page.waitForTimeout(5000);

        const deployBtn = await page.locator('button:has-text("Deploy")').first();

        if (await deployBtn.count() > 0) {
          console.log('Found Deploy button! Clicking...');
          await deployBtn.click();

          console.log('\n🚀 Deployment started! Waiting for completion...');
          console.log('This typically takes 2-3 minutes...\n');

          // Wait for deployment
          let deploymentUrl = null;

          for (let i = 0; i < 60; i++) {
            await page.waitForTimeout(5000);

            // Look for the deployment URL
            const urlLinks = await page.locator('a[href*=".vercel.app"]').all();

            for (const link of urlLinks) {
              const href = await link.getAttribute('href');
              if (href && href.match(/https:\/\/period-tracker[a-z0-9-]*\.vercel\.app/)) {
                deploymentUrl = href;
                break;
              }
            }

            if (deploymentUrl) {
              console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
              console.log(`\nLive URL: ${deploymentUrl}\n`);
              await page.waitForTimeout(3000);
              return deploymentUrl;
            }

            if (i % 6 === 0) {
              console.log(`⏳ Still deploying... (${i * 5} seconds elapsed)`);
            }
          }

          // Timeout - try to get URL from page
          console.log('\nDeployment taking longer than expected...');
          await page.screenshot({ path: 'vercel-deploying.png', fullPage: true });

          const content = await page.content();
          const match = content.match(/https:\/\/period-tracker[a-z0-9-]*\.vercel\.app/);
          if (match) {
            console.log(`\n✅ Found URL: ${match[0]}\n`);
            return match[0];
          }

          return 'Deployment in progress - check https://vercel.com/dashboard';

        } else {
          console.log('Deploy button not found. Taking screenshot...');
          await page.screenshot({ path: 'vercel-no-deploy-btn.png', fullPage: true });
          throw new Error('Deploy button not found');
        }

      } else {
        throw new Error('Continue button not found');
      }
    } else {
      throw new Error('Git URL input field not found');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'vercel-error-url-method.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

console.log('\n========================================');
console.log('  Period Tracker - Vercel Deployment');
console.log('========================================\n');

deployToVercel()
  .then(url => {
    console.log('\n========================================');
    console.log('✅ SUCCESS!');
    console.log('========================================');
    console.log(`\n🌐 Your period tracker is live at:\n\n   ${url}\n`);
    console.log('========================================\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n========================================');
    console.error('❌ DEPLOYMENT FAILED');
    console.error('========================================');
    console.error(`\n${error.message}\n`);
    console.error('Please check the screenshots for details.\n');
    process.exit(1);
  });
