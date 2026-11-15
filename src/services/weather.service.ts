import { AppError } from "../errors/app-error";

interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: "Cielo despejado",
  1: "Mayormente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla con escarcha",
  51: "Llovizna ligera",
  53: "Llovizna moderada",
  55: "Llovizna densa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia fuerte",
  80: "Chubascos ligeros",
  81: "Chubascos moderados",
  82: "Chubascos fuertes",
  95: "Tormenta electrica",
};

export const weatherService = {
  async getCurrentWeather(latitude: number, longitude: number) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
    );
    url.searchParams.set("timezone", "auto");

    let response: Response;
    try {
      response = await fetch(url.toString());
    } catch {
      throw new AppError(502, "No se pudo conectar con el servicio de clima Open-Meteo");
    }

    if (!response.ok) {
      throw new AppError(502, "Respuesta invalida del proveedor de clima Open-Meteo");
    }

    const data = (await response.json()) as OpenMeteoResponse;
    if (!data.current) {
      throw new AppError(502, "Datos de clima no disponibles para estas coordenadas");
    }

    const code = data.current.weather_code;
    return {
      provider: "Open-Meteo",
      temperatureC: data.current.temperature_2m,
      humidityPercent: data.current.relative_humidity_2m,
      windSpeedKmh: data.current.wind_speed_10m,
      weatherCode: code,
      condition: WEATHER_DESCRIPTIONS[code] ?? "Condicion variable",
      observedAt: data.current.time,
    };
  },
};