import { City, Country } from "country-state-city";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import { Card, Metric, Text } from "@tremor/react";
import AreaChartCard from "../components/AreaChartCard";
import LineChartCard from "../components/LineChartCard";
import moment from "moment/moment";

function Sidebar() {
  const [allCountries, setAllCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({});
  const [selectedCity, setSelectedCity] = useState({});
  const [weatherDetails, setWeatherDetails] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // For error message

  useEffect(() => {
    setAllCountries(
      Country.getAllCountries().map((country) => ({
        value: {
          name: country.name,
          latitude: country.latitude,
          longitude: country.longitude,
          isoCode: country.isoCode,
        },
        label: country.name,
      }))
    );
  }, []);

  const handleSelectedCountry = (option) => {
    setSelectedCountry(option);
    setSelectedCity(null); // Reset city when country is changed
  };

  const handleSelectedCity = (option) => {
    setSelectedCity(option);
  };

  const getWeatherDetails = async (e) => {
    e.preventDefault();

    if (!selectedCity) {
      setErrorMessage("Please select a city before fetching weather data.");
      return;
    }

    const fetchWeather = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.value.latitude}&longitude=${selectedCity.value.longitude}&hourly=temperature_2m,relativehumidity_2m,dewpoint_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weathercode,surface_pressure,windspeed_180m,winddirection_180m,temperature_180m,soil_temperature_54cm,soil_moisture_27_81cm,uv_index,uv_index_clear_sky,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=GMT`
    );

    const data = await fetchWeather.json();

    setWeatherDetails(data);
    setErrorMessage(""); // Clear error message if API request is successful
  };

  return (
    <div className="max-w-full mx-auto flex flex-col md:flex-row space-y-5 md:space-y-0 md:space-x-1 bg-gray-50">
      {/* Sidebar Div */}
      <div className="flex flex-col space-y-5 bg-gradient-to-b from-blue-600 to-blue-400 h-auto md:h-screen w-full md:w-[25%] p-6 rounded-lg shadow-lg">
        {/* Select country and city */}
        <div className="flex flex-col justify-center space-y-4">
          <Select
            options={allCountries}
            value={selectedCountry}
            onChange={handleSelectedCountry}
            className="border-none rounded-lg shadow-md"
          />

          <Select
            options={City.getCitiesOfCountry(
              selectedCountry?.value?.isoCode
            ).map((city) => ({
              value: {
                latitude: city.latitude,
                longitude: city.longitude,
                name: city.name,
              },
              label: city.name,
            }))}
            value={selectedCity}
            onChange={handleSelectedCity}
            className="border-none rounded-lg shadow-md"
            isDisabled={!selectedCountry?.value} // Disable city selection if no country selected
          />

          <button
            onClick={getWeatherDetails}
            className="bg-gradient-to-r from-green-500 to-teal-500 w-full py-3 rounded-lg text-white text-sm font-bold shadow-lg hover:scale-105 transition-all duration-200 ease-in-out"
            disabled={!selectedCity} // Disable button if no city is selected
          >
            Get Weather
          </button>

          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p> // Show error message
          )}
        </div>

        {/* Show some details */}
        <div className="flex flex-col space-y-2 text-white">
          <p className="text-xl font-semibold">
            {selectedCountry?.label} | {selectedCity?.label}
          </p>
          <p className="text-sm">
            Latitude: {selectedCity?.value?.latitude} | Longitude:
            {selectedCity?.value?.longitude}
          </p>
        </div>

        {/* Day or Night */}
        <div className="flex items-center space-x-5 text-white">
          <p>
            <WbSunnyIcon />
            {moment(
              new Date(weatherDetails?.daily?.sunrise[0]).getTime()
            ).format("LT")}
          </p>

          <p>
            <NightlightRoundIcon />
            {moment(
              new Date(weatherDetails?.daily?.sunset[0]).getTime()
            ).format("LT")}
          </p>
        </div>
      </div>

      {/* Body Div */}
      <div className="w-full md:w-[75%] h-auto md:h-screen p-6">
        <div className="flex flex-col md:flex-row items-center justify-evenly space-y-4 md:space-y-0 md:space-x-4 mt-4">
          <Card
            decoration="top"
            decorationColor="red"
            className="w-full md:max-w-xs bg-gradient-to-b from-red-500 to-red-400 text-center shadow-lg"
          >
            <Text className="!font-semibold !text-xl">Max Temperature</Text>
            <Metric className="!text-black !font-bold">
              {weatherDetails?.daily?.apparent_temperature_max[0]} &#x2103;
            </Metric>
          </Card>
          <Card
            decoration="top"
            decorationColor="green"
            className="w-full md:max-w-xs bg-gradient-to-b from-green-500 to-green-400 text-center shadow-lg"
          >
            <Text className="!font-semibold !text-xl">Min Temperature</Text>
            <Metric className="!text-black !font-bold">
              {weatherDetails?.daily?.apparent_temperature_min[0]} &#x2103;
            </Metric>
          </Card>
          <Card
            decoration="top"
            decorationColor="blue"
            className="w-full md:max-w-xs bg-gradient-to-b from-blue-500 to-blue-400 text-center shadow-lg"
          >
            <Text className="!font-semibold !text-xl">Wind Direction</Text>
            <Metric className="!text-black !font-bold">
              {weatherDetails?.daily?.winddirection_10m_dominant[0]} &#176;
            </Metric>
          </Card>
        </div>

        {/* Charts */}
        <div className="mt-6 space-y-5">
          <AreaChartCard weatherDetails={weatherDetails} />
          <LineChartCard weatherDetails={weatherDetails} />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
