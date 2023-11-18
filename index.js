const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const config = require('./config');

async function scrollToBottom(page) {
    const distance = 10000;
    while (await page.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
        await page.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
        await page.waitForTimeout(100);
    }
}

async function sendWebhookFound(data) {
    if (data.img.includes('/app/static/media/no_thumbnail')) {
        data.img = 'https://www.olx.pl' + data.img;
    }

    let payload = {
        "content": "@everyone",
        "embeds": [
            {
                "title": data.name,
                "fields": [
                    {
                        "name": "Cena",
                        "value": `${data.price} ${data.negotiable == 'tak' ? '(do negocjacji)' : ''}`
                    },
                    {
                        "name": "Lokalizacja",
                        "value": data.location
                    },
                    {
                        "name": "Link",
                        "value": data.link
                    }
                ],
                "image": {
                    "url": data.img
                }
            }
        ]
    };

    try {
        await axios({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(payload),
            url: config.webhook['found'],
        });
    } catch (e) {
        console.log(`Error while sending webhook: ${e}`);
    }
}

async function sendWebhookLogs(message) {
    const date = new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });

    let payload = {
        "content": `${date} ${message}.`,
    }

    await axios.post(config.webhook['logs'], payload);
}

async function scrapeData(url) {
    const browser = await puppeteer.launch({ headless: 'new', args: ["--no-sandbox"] });
    const page = await browser.newPage();

    try {
        await page.goto(url);
        await page.waitForSelector('[data-cy="l-card"]');

        await scrollToBottom(page);

        const cards = await page.$$('[data-cy="l-card"]');
        const data = [];

        for (let card of cards) {
            const nameElement = await card.$('h6');
            const name = await nameElement.evaluate(el => el.innerText);

            const sizeElement = await card.$('[color=text-global-secondary]');
            const size = await sizeElement.evaluate(el => el.innerText);

            const locationElement = await card.$('[data-testid="location-date"]');
            const location = await locationElement.evaluate(el => el.innerText.split(' - ')[0]);

            const priceElement = await card.$('[data-testid="ad-price"]');
            const price = await priceElement.evaluate(el => el.firstChild.nodeValue.trim());

            const negotiableElement = await card.$('[data-testid="ad-price"] span');
            const negotiable = negotiableElement ? 'tak' : 'nie';

            const linkElement = await card.$('a');
            const link = await linkElement.evaluate(el => el.href);

            const imgElement = await card.$('img');
            const img = await imgElement.evaluate(el => el.src);

            const isPromoted = await card.$('[data-testid="adCard-featured"]');
            if (isPromoted) continue; // pomija wyróżnione oferty

            data.push({ name, size, location, price, negotiable, link, img });
        }

        await browser.close();
        await sendWebhookLogs('Sprawdzam nowe oferty - działa.');
        return data;
    } catch (error) {
        await sendWebhookLogs(`Wystąpił błąd: ${error.message}`);

        await browser.close();

        if (retries > 0) {
            sendWebhookLogs(`Ponawiam próbę... Pozostałe próby: ${retries}`);
            return await scrapeData(url, retries - 1);
        } else {
            sendWebhookLogs("Nie udało się uzyskać danych po wielokrotnych próbach.");
            throw error;
        }
    }

}

async function getOldData() {
    if (fs.existsSync('last.json')) {
        return JSON.parse(fs.readFileSync('last.json', 'utf8'));
    }
    return [];
}

async function saveNewData(data) {
    fs.writeFileSync('last.json', JSON.stringify(data, null, 2));
}

async function compareAndSendNewResults(newData) {
    const oldData = await getOldData();
    const oldLinks = oldData.map(item => item.link);

    for (let item of newData) {
        if (!oldLinks.includes(item.link)) {
            await sendWebhookFound(item);
        }
    }
}

async function main() {
    while (true) {
        try {
            const newData = await scrapeData(config.site_url);
            await compareAndSendNewResults(newData);
            await saveNewData(newData);
        } catch (e) {
            console.error(e);
        }

        await new Promise(resolve => setTimeout(resolve, 300000)); // Czekaj 5 minut
    }
}

main();