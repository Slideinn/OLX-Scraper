const city = "sopot";
const max_price = "3000";
const max_distance = "15"; // kilometers
const rooms = "two";

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