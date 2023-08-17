"use script";

const locations = document.querySelector(`.locations`);
const cloudIndex = document.querySelector(`.cloud-stat`);
const humidityIndex = document.querySelector(`.humidity-stat`);
const windIndex = document.querySelector(`.wind-stat`);
const temperatureIndex = document.querySelector(`.temperature`);
const couldEmoji = document.querySelector(`.atmosphere-emoji`);
const cloudState = document.querySelector(`.atmosphere-state`);
const city = document.querySelector(`.location-name`);
const timeDisplay = document.querySelector(`.time`);
const imageDisplay = document.querySelector(`.cloud-illustration-image`);
const forecastWrapper = document.querySelector(`.forecast-container`);
// console.log(imageDisplay);

const nameOfLocations = [`Moscow`, `Manchester`, `NewYork`, `California`];

const cloudEmojiCollection = new Map([
  [`Clear`, `☀`],
  [`Partly Cloudy`, `⛅`],
  [`Cloudy`, `☁`],
  [`Fog`, `🌫`],
  [`Partly Rain`, `🌦`],
  [`Rain`, `🌧`],
  [`Heavy Rain`, `⛈`],
]);

const extractCloudEmoji = function (summary) {
  const stateOfClouds = [...cloudEmojiCollection.keys()];
  // console.log(stateOfClouds);
  const findEmoji = stateOfClouds.find((state) => state === summary);
  return cloudEmojiCollection.get(findEmoji);
};

const createForecastForm = function (incomingData) {
  // time trong data laf UNIX time -> 1 UNIX time = 1 giay => lay time * 1000 de bien no thanh miliseconds => timestamp
  const forecastDayOfTheWeek = Intl.DateTimeFormat(`en-UK`, {
    weekday: `long`,
    day: `numeric`,
    month: `short`,
    year: `numeric`,
  }).format(new Date(incomingData.time * 1000));

  const html = `
    <li class="forecast-weather">
    <h5>${forecastDayOfTheWeek}</h5>
    ☁:<span class="forecast-cloudy">${Math.trunc(
      (incomingData.cloudCover / 1) * 100
    )}%</span> 💧:<span
      class="forecast-humidity"
      >${Math.trunc((incomingData.humidity / 1) * 100)}%</span
    >
    💨:<span class="forecast-wind">${Math.trunc(
      incomingData.windSpeed
    )}km/h</span>
    </li>
  `;
  forecastWrapper.insertAdjacentHTML(`beforeend`, html);
};

const forecastWeather = function (data) {
  for (let i = 1; i <= 7; i++) {
    createForecastForm(data[i]);
  }
};

const readWeather = async function (coords, inputCity) {
  try {
    const [lat, lon] = coords;
    const weather =
      await fetch(`https://api.pirateweather.net/forecast/8bRpo283GjRCygzf/${lat},${lon}
    `);

    if (!weather.ok)
      throw new Error(`There is something wrong with weather data`);
    const weatherReadable = await weather.json();
    // console.log(weatherReadable);
    const weatherData = [
      ((weatherReadable.currently.cloudCover / 1) * 100).toFixed(1),
      ((weatherReadable.currently.temperature - 32) / 1.8).toFixed(1),
      ((weatherReadable.currently.humidity / 1) * 100).toFixed(1),
      weatherReadable.currently.summary,
      weatherReadable.currently.windSpeed,
    ];
    const [cloudCover, temperature, humidity, cloudSummary, windSpeed] =
      weatherData;
    cloudIndex.textContent = cloudCover + `%`;
    humidityIndex.textContent = humidity + `%`;
    windIndex.textContent = windSpeed + `km/h`;
    temperatureIndex.textContent = temperature + `°C`;
    couldEmoji.textContent = extractCloudEmoji(cloudSummary);
    cloudState.textContent = cloudSummary;

    const imageName = cloudSummary
      .split(``)
      .map((char) => (char === ` ` ? `` : char))
      .join(``);
    imageDisplay.src = `./images/photo-${imageName}.webp`;
    city.textContent = inputCity;

    const forecastData = weatherReadable.daily.data;
    forecastWeather(forecastData);
  } catch (err) {
    console.error(err);
  }
};

const locateLocation = async function (place) {
  try {
    const locale = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${place}&lang=en&limit=10&type=city&apiKey=c70efa790da141298a8aad51719c92e4`
    );

    if (!locale.ok)
      throw new Error(`There is something wrong with locate location data`);
    const localeReadable = await locale.json();
    const coords = [
      localeReadable.features.at(0).properties.lat,
      localeReadable.features.at(0).properties.lon,
    ];
    return readWeather(coords, place);
  } catch (err) {
    console.error(err);
  }
};

locations.addEventListener(`click`, function (e) {
  if (e.target.classList.contains(`location`)) {
    if (!e.target) return;
    const readDataLocation = nameOfLocations[+e.target.dataset.location];
    locateLocation(readDataLocation);
  }
});

const displayTime = function () {
  return (timeDisplay.textContent = Intl.DateTimeFormat(`en-UK`, {
    hour: `2-digit`,
    minute: `2-digit`,
    weekday: `long`,
    day: `numeric`,
    month: `short`,
    year: `2-digit`,
  }).format(new Date()));
};

setInterval(displayTime, 1000);

(function () {
  locateLocation(nameOfLocations[0]);
})();
