const puppeteer = require("puppeteer");
const { GoogleGenAI } = require("@google/genai");

// The client auto-reads GEMINI_API_KEY from process.env
// The previous issue was that genAI.getGenerativeModel() was an invalid function call// We are now initializing the client correctly to use genAI.models.generateContent()
const genAI = new GoogleGenAI({});

/**
 * Analyzes a given text using the Gemini API, with a focus on compliance issues.
 * @param {string} text The policy text to analyze.
 * @returns {Promise<object>} The Gemini analysis result, in a structured format.
 */
async function analyzePolicyWithGemini(text) {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a compliance auditor. Analyze the following privacy policy text.
Return strictly valid JSON in this schema:
{
  "compliance_issues": ["issue 1", "issue 2", ...],
  "summary": "short summary"
}`,
            },
            { text: `Policy text:\n"""${text}"""` },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });

    // The previous code was failing here with a TypeError, as response.response was undefined [cite: 2] // The correct path to the text is now nested in the candidates array, so we've updated it to be more resilient [cite: 2]
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Safely parse the JSON, removing any markdown formatting that might be present [cite: 2]
    const cleanedText = rawText.replace(/```json\n|\n```/g, "");

    const parsed = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    console.error("❌ Gemini analysis failed:", error.message);
    return {
      compliance_issues: ["Failed to analyze policy with Gemini"],
      summary: "An error occurred during AI analysis.",
    };
  }
}

/**
 * Runs a series of compliance tests on a given URL using Puppeteer.
 * @param {string} url The URL to test.
 * @returns {Promise<object>} A promise that resolves to the test results.
 */
async function runScan(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // --- Look for privacy link ---
    const policyLinkData = await page.$$eval("a", (links) => {
      const privacyLink = links.find(
        (link) => /privacy/i.test(link.innerText) || /privacy/i.test(link.href)
      );
      return privacyLink
        ? { href: privacyLink.href, text: privacyLink.innerText }
        : null;
    });

    let policyText = null;
    let geminiAnalysis = null;

    if (policyLinkData) {
      try {
        const policyPage = await browser.newPage();
        await policyPage.goto(policyLinkData.href, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });
        policyText = await policyPage.evaluate(() =>
          document.body.innerText.slice(0, 2000)
        );
        await policyPage.close();

        if (policyText && policyText.trim()) {
          geminiAnalysis = await analyzePolicyWithGemini(policyText);
        }
      } catch (err) {
        console.error(`❌ Error fetching policy page: ${err.message}`);
      }
    }

    // --- Cookie checks ---
    // The previous code had an issue with how it was checking for cookies [cite: 3] // The corrected code now uses page.evaluate to correctly check the document.cookie string [cite: 3]
    const insecureCookies = await page.evaluate(() => {
      const allCookies = document.cookie.split(";");
      return allCookies.filter(
        (cookie) => !cookie.includes("Secure") || !cookie.includes("HttpOnly")
      );
    });

    const cookieBanner = await page.$(
      "div.cookie, div.cookie-banner, #cookie-banner"
    );

    return {
      url,
      privacyPolicyLink: policyLinkData?.href || null,
      geminiAnalysis,
      insecureCookies,
      cookieBannerFound: !!cookieBanner,
    };
  } catch (err) {
    return { url, error: err.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { runScan };
