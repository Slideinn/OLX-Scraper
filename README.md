# OLX Apartment Scraper

This project is a script that scrapes the OLX auction website to find apartments that match specific criteria. It was developed during my personal apartment hunting process and is designed to automate the search, making it easier to find suitable listings.

This script is easily adjustable to fit your needs. While it was originally designed to scrape apartment listings, it can be used to scrape any type of listing on the OLX website.

To customize the script, you need to make changes in the config.js file. You can set up your own link and parameters to scrape different types of listings.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js installed on your machine to run this script.

### Installing

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Run `npm install` to install the necessary dependencies.

## Configuration

Before running the script, you need to set your criteria for apartment searching and your Discord webhook URLs in the `config.js` file. 

Here are the options you can set:

- `city`: The city where you are looking for an apartment.
- `max_price`: The maximum price you are willing to pay for the apartment.
- `max_distance`: The maximum distance from the city you are willing to consider.
- `rooms`: The number of rooms you want in the apartment.

You also need to set your Discord webhook URLs:

- `logs`: The webhook URL for logs.
- `found`: The webhook URL for found apartments.

Here is an example of how to set these options:

```javascript
const city = "gdynia";
const max_price = "5000";
const max_distance = "5"; // kilometers
const rooms = "three";

const webhook = {
  "logs": "https://discord.com/api/webhooks/your_logs_webhook_url",
  "found": "https://discord.com/api/webhooks/your_found_webhook_url"
}

const site_url = `https://www.olx.pl/nieruchomosci/mieszkania/wynajem/${city}/?search%5Bdist%5D=${max_distance}&search%5Border%5D=created_at:desc&search%5Bfilter_float_price%3Ato%5D=${max_price}&search[filter_enum_rooms][0]=${rooms}`;

module.exports = {
  city,
  max_price,
  max_distance,
  site_url,
  webhook
};
```

Replace `"your_logs_webhook_url"` and `"your_found_webhook_url"` with your actual Discord webhook URLs.

## Usage

To start the script, run `node index.js` in the terminal. The script will start scraping the OLX website for apartment listings.

The script scrapes the following information from each listing:

- Name
- Size
- Location
- Price
- Negotiability
- Link to the listing
- Image from the listing

The script skips promoted listings. The scraped data is then returned in an array.

If an error occurs during the scraping process, the script logs the error message and attempts to retry the process a certain number of times before finally throwing the error.

## Screenshots
![Discord screenshot](https://i.imgur.com/6oXKPaT.png)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments

- Thanks to the Puppeteer library for making web scraping in Node.js easier.

## Disclaimer

This script is intended for personal use. Please use responsibly and respect the terms of service of the website you are scraping.
