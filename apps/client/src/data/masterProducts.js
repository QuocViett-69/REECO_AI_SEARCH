export const masterProducts = [
  {
    "id": "CSI_109",
    "model": "109",
    "name": "Temperature Sensor (-50 to +70C)",
    "category": "Sensors",
    "subcategory": "Temperature Sensors (Air/Soil/Water)",
    "deviceType": "Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/179",
    "productUrl": "https://www.campbellsci.com/products/109",
    "specs": {
      "General": {
        "Model": "109",
        "Category": "Sensors",
        "Subcategory": "Temperature Sensors (Air/Soil/Water)",
        "Device Type": "Sensor",
        "Output": "Analog",
        "Operating Temperature Range": "-50°C to +70°C"
      },
      "Measurements": {
        "Supported": "Temperature"
      }
    }
  },
  {
    "id": "CSI_TEMPVUE20_S",
    "model": "TempVue20-S",
    "name": "TempVue™20",
    "category": "Sensors",
    "subcategory": "Air Temperature Sensors",
    "deviceType": "Air Temperature Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/14672",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "TempVue20-S",
        "Category": "Sensors",
        "Subcategory": "Air Temperature Sensors",
        "Device Type": "Air Temperature Sensor",
        "Product Name": "TempVue™20",
        "Product Variant": "SDI-12 output version"
      },
      "Measurements": {
        "Supported": "Air Temperature"
      }
    }
  },
  {
    "id": "CSI_TEMPVUE50",
    "model": "TempVue50",
    "name": "TempVue™50",
    "category": "Sensors",
    "subcategory": "Water and Soil Temperature Sensors",
    "deviceType": "Water and Soil Temperature Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/14775",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "TempVue50",
        "Category": "Sensors",
        "Subcategory": "Water and Soil Temperature Sensors",
        "Device Type": "Water and Soil Temperature Sensor"
      },
      "Measurements": {
        "Supported": "Water Temperature"
      },
      "General Specifications": {
        "Product Type": "Precision Digital Water Temperature Sensor",
        "Sensor Description": "Band gap sensor mounted to a circuit board",
        "Measurement Parameter": "Water temperature",
        "Communication Protocol": "SDI-12 version 1.4",
        "Default SDI-12 Address": "0",
        "Measurement Uncertainty": "0.1 °C (-0.5 to +40 °C)"
      }
    }
  },
  {
    "id": "CSI_EE181",
    "model": "EE181",
    "name": "E+E Temperature/RH Sensor (-40 to +60C) w/o Cable",
    "category": "Sensors",
    "subcategory": "Air Temperature and Relative Humidity Sensors",
    "deviceType": "Air Temperature and Relative Humidity Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/9241",
    "productUrl": "https://www.campbellsci.com/products/ee181-l",
    "specs": {
      "General": {
        "Model": "EE181",
        "Category": "Sensors",
        "Subcategory": "Air Temperature and Relative Humidity Sensors",
        "Device Type": "Air Temperature and Relative Humidity Sensor"
      },
      "Measurements": {
        "Supported": "Temperature, Relative Humidity"
      },
      "SPECIFICATIONS": {
        "Measurement Description": "Temperature | relative humidity",
        "Signal Type/Output": "Analog voltage",
        "Supply Voltage": "7 to 30 Vdc | typically powered by the datalogger’s 12 V supply",
        "Average Current Consumption": "< 1.2 mA",
        "Filter Description": "30 μm pore size | stainless-steel mesh",
        "Startup Time": "2 s"
      },
      "AIR TEMPERATURE": {
        "Sensing Element": "1000 Ω Platinum Resistance Thermometer (PRT)",
        "Measurement Range": "-40° to +60°C",
        "Storage Temperature Range": "-40° to +80°C",
        "Output Signal Range": "0 to 1 Vdc",
        "Accuracy": "±0.2°C (at +23°C)"
      },
      "RELATIVE HUMIDITY": {
        "Sensing Element": "Capacitance",
        "Measurement Range": "0 to 100% RH (non-condensing)",
        "Output Signal Range": "0 to 1 Vdc",
        "Temperature Dependence": "Typically 0.03% RH/°C",
        "Accuracy": "± (1.5 + 0.015 • RH reading) % RH (at -40° to +60°C) | ± (1.4 + 0.01 • RH readin"
      }
    }
  },
  {
    "id": "CSI_HYGROVUE10",
    "model": "HygroVue10",
    "name": "Digital Temperature/RH Sensor w/M12 Connector w/o",
    "category": "Sensors",
    "subcategory": "Air Temperature and Relative Humidity Sensors",
    "deviceType": "Air Temperature and Relative Humidity Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/11956",
    "productUrl": "https://www.campbellsci.com/products/hygrovue10",
    "specs": {
      "General": {
        "Model": "HygroVue10",
        "Category": "Sensors",
        "Subcategory": "Air Temperature and Relative Humidity Sensors",
        "Device Type": "Air Temperature and Relative Humidity Sensor"
      },
      "Measurements": {
        "Supported": "Temperature, Relative Humidity"
      },
      "SPECIFICATIONS": {
        "Compatibility": "Fully SDI-12 V1.3-compliant digital output (verified with an SDI-12 Verifier) | ",
        "Sensor element": "Sensirion SHT35 derivative",
        "Calibration traceability": "NIST and NPL standards. | See Sensor element calibration (p. 36) for details of ",
        "Supply voltage": "7 to 28 VDC",
        "Current consumption": "50 μA quiescent, typical | 0.6 mA during 0.5 s measurement typical",
        "Warm-up time": "Sensor normally powered all the time; if power is switched, allow 1.8 s for sens"
      },
      "Temperature measurement": {
        "Operating range": "−40 to 70 °C",
        "Accuracy*": "±0.2 °C (−40 to 70 °C) | ±0.1 °C (20 to 60 °C)",
        "Long term drift": "≤±0.03 °C/year",
        "Reported resolution": "0.001 °C",
        "Repeatability**": "0.04 °C",
        "Response time": "130 s (63% response time in air moving at 1 m/s)"
      },
      "Relative humidity measurement": {
        "Operating range": "0 to 100% RH",
        "Accuracy (at 25 °C)*": "±1.5% (0 to 80% RH) | ±2% (80 to 100% RH)",
        "Temperature dependence": "< ±1% RH (−40 to 60 °C)",
        "Short term hysteresis": "< ±1% RH",
        "Long-term stability": "±0.5% per year (drift in clean air conditions)",
        "Reported resolution": "0.001% RH"
      }
    }
  },
  {
    "id": "CSI_BAROVUE10",
    "model": "BaroVue10",
    "name": "Digital Barometer -40 to +60C, 76cm (30 Inch)",
    "category": "Sensors",
    "subcategory": "Barometric Pressure Sensors",
    "deviceType": "Barometric Pressure Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/13865",
    "productUrl": "https://www.campbellsci.com/products/barovue10",
    "specs": {
      "General": {
        "Model": "BaroVue10",
        "Category": "Sensors",
        "Subcategory": "Barometric Pressure Sensors",
        "Device Type": "Barometric Pressure Sensor"
      },
      "Measurements": {
        "Supported": "Barometric Pressure"
      },
      "General Specifications": {
        "Note": "These specifications assume the recommended desiccation is used",
        "Pressure Range": "500 to 1100 hPa",
        "Temperature Range": "-40°C to +60°C",
        "Supply Voltage": "9 to 28 Vdc",
        "Elevation": "Approximately 609.6 m (2,000 ft) below sea level, as in a mine, to 4,572 m (15,0",
        "Current Consumption": "200 µA, sleep mode"
      },
      "ACCURACY": {
        "Calibration Uncertainty": "±0.15 hPa",
        "Uncertainty": "±0.3 hPa at 20°C",
        "Total Uncertainty": "±0.5 hPa from -40°C to +60°C",
        "Long-Term Stability": "±0.1 hPa/year",
        "Power Supply Rejection": "Negligible",
        "Measurement Noise": "0.05 hPa RMS"
      }
    }
  },
  {
    "id": "CSI_52202",
    "model": "52202",
    "name": "RM Young Heated Rain Gage w/6.3 Orifice",
    "category": "Sensors",
    "subcategory": "Precipitation Sensors",
    "deviceType": "Precipitation Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/1700",
    "productUrl": "https://www.campbellsci.com/products/pn52202",
    "specs": {
      "General": {
        "Model": "52202",
        "Category": "Sensors",
        "Subcategory": "Precipitation Sensors",
        "Device Type": "Precipitation Sensor",
        "Sensor Type": "Tipping bucket with magnetic reed switch, normally open",
        "Measurement Uncertainty": "2% for up to 25 mm/h (1 in./h)"
      },
      "Measurements": {
        "Supported": "Precipitation"
      }
    }
  },
  {
    "id": "CSI_RAINVUE10_MM",
    "model": "RainVue10-MM",
    "name": "RainVue™10",
    "category": "Sensors",
    "subcategory": "Precipitation Sensors",
    "deviceType": "Precipitation Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/13569",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "RainVue10-MM",
        "Category": "Sensors",
        "Subcategory": "Precipitation Sensors",
        "Device Type": "Precipitation Sensor"
      },
      "Measurements": {
        "Supported": "Temperature, Precipitation, Precipitation Intensity, Tilt"
      },
      "General Specifications": {
        "Product Type": "SDI-12 Precipitation Sensor with Plastic Funnel",
        "Manufacturer": "Campbell Scientific, Inc.",
        "Device Classification": "Primary measurement device / precipitation sensor",
        "Product Family": "RainVue Series",
        "Available Configuration": "0.1 mm (0.0039 inch) tip",
        "Sensor Type": "Tipping bucket with magnetic reed switch"
      }
    }
  },
  {
    "id": "CSI_CSAT3B_NC",
    "model": "CSAT3B-NC",
    "name": "CSAT3B 3-D Sonic Anemometer w/Integrated Electroni",
    "category": "Sensors",
    "subcategory": "Wind Speed and Wind Direction Sensors",
    "deviceType": "Wind Speed and Wind Direction Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/5805",
    "productUrl": "https://www.campbellsci.com/products/csat3b",
    "specs": {
      "General": {
        "Model": "CSAT3B-NC",
        "Category": "Sensors",
        "Subcategory": "Wind Speed and Wind Direction Sensors",
        "Device Type": "Wind Speed and Wind Direction Sensor"
      },
      "Measurements": {
        "Supported": "Wind Speed, Wind Direction"
      },
      "CONFIGURATION": {
        "Configuration Suffix": "NC",
        "Carrying Case": "No Carrying Case"
      },
      "SPECIFICATIONS": {
        "Sensor": "3-dimensional sonic anemometer",
        "Measurement Description": "Highest-quality wind speed and direction",
        "Operating Temperature Range": "-40 to +50°C (equivalent to 305 to 368 m s⁻¹ in speed of sound)",
        "Outputs": "ux, uy, uz, Ts | ux, uy, uz are wind components referenced to the anemometer axe",
        "Signal Type/Output": "SDM, CPI, USB, RS-485",
        "Speed of Sound": "Determined from three acoustic paths. | Corrected for crosswind effects."
      },
      "WIND ACCURACY": {
        "-NOTE-": "Accuracy specifications assume the following: | -40° to +50°C operating range | ",
        "Maximum Offset Error": "< ±8.0 cm s⁻¹ (ux, uy) | < ±4.0 cm s⁻¹ (uz)",
        "Maximum Gain Error": "< ±3% of reading (wind vector within ±10° of horizontal) | < ±2% of reading (win"
      },
      "MEASUREMENT RESOLUTION": {
        "ux, uy": "1 mm s⁻¹ rms",
        "uz": "0.5 mm s⁻¹ rms",
        "Ts": "0.002°C RMS (at 25°C)",
        "Wind Direction": "< 0.058° (ux = uy ≤ 1 m s⁻¹)"
      },
      "MEASUREMENT RATES": {
        "Data Logger Triggered": "1 to 100 Hz",
        "Unprompted Output (to PC)": "10, 20, 50, or 100 Hz",
        "Internal Self-Trigger Rate": "100 Hz"
      },
      "MEASUREMENT DELAY": {
        "Data Logger Triggered (no filter)": "1 trigger period (1 scan interval)",
        "Unprompted Output (no filter)": "10 ms",
        "Filtered Output (data-logger-prompted or unprompted to PC)": "395 ms (with 10 Hz bandwidth filter) | 155 ms (with 25 Hz bandwidth filter) | 79"
      },
      "INTERNAL MONITOR MEASUREMENTS": {
        "Update Rate": "2 Hz",
        "Inclinometer Accuracy": "±1°",
        "Relative Humidity Accuracy": "±7% (over 90 to 100% range) | ±7% (over 0 to 10% range) | ±3% (over 10 to 90% ra",
        "Board Temperature Accuracy": "±2°C"
      },
      "SDM": {
        "-NOTE-": "Used for data-logger-based data acquisition.",
        "Bit Period": "10 µs to 1 ms",
        "Cable Length": "7.6 m (25 ft) max (@ 10 µs bit period) | 76 m (250 ft) max (@ 1 ms bit period)",
        "Address Range": "1 to 14",
        "Bus Clocks per Sample": "~200"
      },
      "CPI": {
        "-NOTE-": "Used for data-logger-based data acquisition.",
        "Baud Rate": "50 kbps to 1 Mbps",
        "Cable Length": "122 m (400 ft) max (@ 250 kbps) | 15 m (50 ft) max (@ 1 Mbps) | 853 m (2800 ft) ",
        "Address Range": "1 to 120",
        "Bus Clocks per Sample": "~300"
      },
      "RS-485": {
        "-NOTE-": "Used for configuration or PC-based data acquisition.",
        "Baud Rate": "9.6 kbps to 115.2 kbps",
        "Cable Length": "610 m (2000 ft) max (@ 9.6 kbps) | 305 m (1000 ft) max (@ 115.2 kbps)",
        "Bus Clocks per Sample": "~500 (ASCII formatted)"
      },
      "USB": {
        "-NOTE-": "Used for configuration or PC-based data acquisition.",
        "Connection Speed": "USB 2.0 full speed 12 Mbps",
        "Cable Length": "5 m (16.4 ft) maximum"
      },
      "POWER REQUIREMENTS": {
        "Voltage Supply / Anemometer Voltage Requirement": "9.5 to 32 Vdc",
        "Current at 10 Hz Measurement Rate": "65 mA (@ 24 Vdc) | 110 mA (@ 12 Vdc)",
        "Current at 100 Hz Measurement Rate": "80 mA (@ 24 Vdc) | 145 mA (@ 12 Vdc)"
      }
    }
  },
  {
    "id": "CSI_CLIMAVUE40",
    "model": "ClimaVue40",
    "name": "Compact Digital RS-485 Modbus RTU Weather Sensor",
    "category": "Sensors",
    "subcategory": "All-in-One Weather Sensors",
    "deviceType": "All-in-One Weather Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/15290",
    "productUrl": "https://www.campbellsci.com/products/climavue40",
    "specs": {
      "General": {
        "Model": "ClimaVue40",
        "Category": "Sensors",
        "Subcategory": "All-in-One Weather Sensors",
        "Device Type": "All-in-One Weather Sensor"
      },
      "Measurements": {
        "Supported": "Air Temperature, Relative Humidity, Precipitation, Wind Speed"
      },
      "GENERAL SPECIFICATIONS": {
        "Measurements Made": "Air temperature, precipitation, relative humidity, and wind direction and speed",
        "Measurement Scan Rate": "1 s",
        "Input Supply Voltage": "9 to 15 Vdc",
        "Operating Temperature Range": "-50° to +60°C",
        "Average Current Drain @ 12 Vdc": "6 mA",
        "Communications": "RS-485 Modbus"
      },
      "PRECIPITATION": {
        "Precipitation Range": "0 to 1,500 mm/h",
        "Precipitation Resolution": "0.017 mm",
        "Precipitation Uncertainty": "±5% of measurement (from 0 to 1,000 mm/h)"
      },
      "VAPOR PRESSURE": {
        "Vapor Pressure Range": "0 to 47 kPa",
        "Vapor Pressure Resolution": "0.01 kPa",
        "Vapor Pressure Uncertainty": "Varies with temperature and humidity"
      },
      "AIR TEMPERATURE": {
        "Air Temperature Range": "-50° to +60°C",
        "Air Temperature Resolution": "0.1°C",
        "Air Temperature Sensor Uncertainty": "±0.2°C at 25°C",
        "Air Temperature Measurement Uncertainty": "±0.6°C from -20° to +50°C"
      },
      "RELATIVE HUMIDITY": {
        "Relative Humidity Measurement Range": "0 to 100%",
        "Relative Humidity Resolution": "0.1",
        "Relative Humidity Uncertainty": "±3% RH typical (varies with temperature and humidity)"
      },
      "BAROMETRIC PRESSURE": {
        "Barometric Pressure Range": "1 to 120 kPa",
        "Barometric Pressure Resolution": "0.01 kPa",
        "Barometric Pressure Uncertainty": "±0.05 kPa at 25°C",
        "Barometric Pressure Equilibration": "< 10 ms",
        "Barometric Pressure Long-Term Drift": "< 0.1 kPa/year, typical"
      },
      "HORIZONTAL WIND SPEED": {
        "Horizontal Wind Speed Range": "0 to 60 m/s",
        "Horizontal Wind Speed Resolution": "0.01 m/s",
        "Horizontal Wind Speed Uncertainty": "0.3 m/s or 6% of measurement, whichever is greater"
      },
      "WIND GUST": {
        "Wind Gust Range": "0 to 60 m/s",
        "Wind Gust Resolution": "0.01 m/s",
        "Wind Gust Uncertainty": "0.3 m/s or 6% of measurement, whichever is greater"
      },
      "WIND DIRECTION": {
        "Wind Direction Range": "0° to 359°",
        "Wind Direction Resolution": "1°",
        "Wind Direction Uncertainty": "±5°"
      },
      "TILT": {
        "Tilt Range": "0° to 180°",
        "Tilt Resolution": "0.1°",
        "Tilt Uncertainty": "±1°"
      },
      "LIGHTNING STRIKE COUNT": {
        "Lightning Strike Count Range": "0 to 65,535 strikes",
        "Lightning Strike Count Resolution": "1 strike",
        "Lightning Strike Count Uncertainty": ">25% detection at <10 km typical (variable with distance)"
      },
      "LIGHTNING AVERAGE DISTANCE": {
        "Lightning Average Distance Range": "0 to 40 km",
        "Lightning Average Distance Resolution": "3 km",
        "Lightning Average Distance Uncertainty": "Variable"
      }
    }
  },
  {
    "id": "CSI_CLIMAVUE50G2",
    "model": "ClimaVue50G2",
    "name": "G2 Compact Digital SDI-12 Weather Sensor (-50 to",
    "category": "Sensors",
    "subcategory": "All-in-One Weather Sensors",
    "deviceType": "All-in-One Weather Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/15290",
    "productUrl": "https://www.campbellsci.com/products/climavue50-g2",
    "specs": {
      "General": {
        "Model": "ClimaVue50G2",
        "Category": "Sensors",
        "Subcategory": "All-in-One Weather Sensors",
        "Device Type": "All-in-One Weather Sensor"
      },
      "Measurements": {
        "Supported": "Air Temperature, Relative Humidity, Barometric Pressure, Precipitation"
      },
      "GENERAL SPECIFICATIONS": {
        "Measurements Made": "Air temperature, barometric pressure, lightning average distance, lightning stri",
        "Output": "SDI-12",
        "Minimum Supply Voltage": "3.6 Vdc continuous",
        "Maximum Supply Voltage": "15.0 Vdc continuous",
        "Operating Temperature Range": "-50° to +60°C (generally)0° to +60°C (precipitation sensor, but will not measure",
        "Typical Current Drain @ 12 Vdc": "< 1 mA (average)"
      },
      "POWER CONSUMPTION": {
        "Quiescent": "0.3 mA",
        "Maximum Peak Current": "33 mA",
        "Average Using the R7! Command every 10 s": "1.0 mA",
        "Average Using the R7! Command every 60 s (or slower)": "0.4 mA"
      },
      "PRECIPITATION": {
        "Precipitation Measurement Range": "0 to 1,500 mm/h (60 in./h)",
        "Precipitation Resolution": "0.017 mm",
        "Precipitation Accuracy": "±5% of measurement (from 0 to 1,000 mm/h or 0 to 40 in./h)"
      },
      "VAPOR PRESSURE": {
        "Vapor Pressure Measurement Range": "0 to 47 kPa",
        "Vapor Pressure Resolution": "0.01 kPa",
        "Vapor Pressure Accuracy or Repeatability": "Varies with temperature and humidity±0.2 kPa typical below 40°C"
      },
      "AIR TEMPERATURE": {
        "Air Temperature Measurement Range": "-50° to +60°C",
        "Air Temperature Resolution": "0.1°C",
        "Air Temperature Accuracy": "±0.6°C"
      },
      "RELATIVE HUMIDITY": {
        "Relative Humidity Measurement Range": "0 to 100%",
        "Relative Humidity Resolution": "0.001",
        "Relative Humidity Accuracy": "±2.5% RH typical (varies with temperature and humidity)"
      },
      "BAROMETRIC PRESSURE": {
        "Barometer Operating Temperature Range": "-40° to +60°C",
        "Barometric Pressure Measurement Range": "10 to 1200 hPa",
        "Barometric Pressure Resolution": "0.1 hPa",
        "Barometric Pressure Accuracy": "±0.5 hPa (over the range of -40° to +60°C)±0.1 hPa (over the range of -10° to +5",
        "Barometric Pressure Long-Term Drift": "< 1 hPa/year"
      },
      "WIND SPEED": {
        "Wind Speed Maximum": "3 s gust",
        "Wind Speed Measurement Range": "0 to 60 m/s (0 to 135 mph)",
        "Wind Speed Resolution": "0.01 m/s (0.02 mph)",
        "Wind Speed Accuracy or Repeatability": "0.3 m/s (0.67 mph) or 6%, whichever is greater"
      },
      "WIND DIRECTION": {
        "Wind Direction Measurement Range": "0° to 359°",
        "Wind Direction Resolution": "1°",
        "Wind Direction Accuracy": "±5°"
      },
      "SOLAR RADIATION": {
        "Solar Radiation Measurement Range": "0 to 1750 W m⁻²",
        "Solar Radiation Resolution": "1 W m⁻²",
        "Solar Radiation Accuracy": "±5% of measurement (typical)",
        "Solar Radiation Spectral Range": "300 to 1150 nm"
      },
      "TILT": {
        "Tilt Measurement Range": "0° to 180°",
        "Tilt Resolution": "0.1°",
        "Tilt Accuracy": "±1°"
      },
      "LIGHTNING STRIKE COUNT": {
        "Lightning Strike Count Measurement Range": "0 to 65,535 strikes",
        "Lightning Strike Count Resolution": "1 strike",
        "Lightning Strike Count Accuracy": ">25% detection at <10 km typical (variable with distance)"
      },
      "LIGHTNING AVERAGE DISTANCE": {
        "Lightning Average Distance Measurement Range": "0 to 40 km (0 to 24.9 mi)",
        "Lightning Average Distance Resolution": "3 km (1.86 mi)",
        "Lightning Average Distance Accuracy": "Variable"
      }
    }
  },
  {
    "id": "CSI_METSENS500_DS",
    "model": "MetSENS500-DS",
    "name": "MetSENS500-DS",
    "category": "Sensors",
    "subcategory": "All-in-One Weather Sensors",
    "deviceType": "All-in-One Weather Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/11230",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "MetSENS500-DS",
        "Category": "Sensors",
        "Subcategory": "All-in-One Weather Sensors",
        "Device Type": "All-in-One Weather Sensor",
        "Product Name": "MetSENS500-DS",
        "Base Model": "MetSENS500"
      },
      "Measurements": {
        "Supported": "Air Temperature, Relative Humidity, Barometric Pressure, Wind Speed"
      }
    }
  },
  {
    "id": "CSI_CS301",
    "model": "CS301",
    "name": "Apogee SP-110-SS Pyranometer, w/o Cable (-40 to +70C)*",
    "category": "Sensors",
    "subcategory": "Solar Radiation Sensors",
    "deviceType": "Solar Radiation Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/11307",
    "productUrl": "https://www.campbellsci.com/products/cs301",
    "specs": {
      "General": {
        "Model": "CS301",
        "Category": "Sensors",
        "Subcategory": "Solar Radiation Sensors",
        "Device Type": "Solar Radiation Sensor"
      },
      "Measurements": {
        "Supported": "Solar Radiation"
      },
      "SPECIFICATIONS": {
        "Sensor": "Silicon photovoltaic detector mounted in a cosine-corrected head",
        "Measurement Description": "Measures sun plus sky radiation",
        "ISO Classification": "Class C (second class)",
        "Light Spectrum Waveband": "360 to 1120 nm (wavelengths where response is 10% of maximum)",
        "Measurement Range": "0 to 2000 W/m² | Full sunlight ≈1000 W/m²",
        "Output Range": "0 to 400 mV (full scale output)"
      }
    }
  },
  {
    "id": "CSI_NR01",
    "model": "NR01",
    "name": "4Component Net Radiation Sensor",
    "category": "Sensors",
    "subcategory": "Solar Radiation Sensors",
    "deviceType": "Solar Radiation Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/6322",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "NR01",
        "Category": "Sensors",
        "Subcategory": "Solar Radiation Sensors",
        "Device Type": "Solar Radiation Sensor",
        "Product Name": "NR01",
        "Product Type": "Four-Component Net Radiometer"
      },
      "Measurements": {
        "Supported": "Net Radiation"
      }
    }
  },
  {
    "id": "CSI_CS125_ST",
    "model": "CS125-ST",
    "name": "CS125 Present Weather Sensor -ST -25 to +60C -1",
    "category": "Sensors",
    "subcategory": "Present Weather Sensors",
    "deviceType": "Present Weather Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/8886",
    "productUrl": "https://www.campbellsci.com/products/cs125",
    "specs": {
      "General": {
        "Model": "CS125-ST",
        "Category": "Sensors",
        "Subcategory": "Present Weather Sensors",
        "Device Type": "Present Weather Sensor"
      },
      "Measurements": {
        "Supported": "Present Weather, Visibility"
      },
      "CONFIGURATION": {
        "Base Model": "CS125",
        "Temperature Version": "ST",
        "Configuration Description": "CS125 | Temperature version: ST | Operating temperature: -25° to +60°C",
        "Cable Length Options": "5 m (17 ft) per sensor | 10 m (33 ft) per sensor | 15 m (50 ft) per sensor | 30 ",
        "Warranty": "2 years"
      },
      "ENVIRONMENTAL": {
        "Operating Temperature Range": "-25° to +60°C"
      },
      "GENERAL / OPERATIONAL SPECIFICATIONS": {
        "Measurement Description": "Present Weather and Visibility",
        "Maximum Reported Visibility": "100 km | 62.1 mi",
        "Minimum Reported Visibility": "5 m | 16.4 ft",
        "Accuracy": "Up to 600 m (1968.5 ft): ±8% | 600 to 10,000 m (1968.5 to 32,808.4 ft): ±10% | 1",
        "Resolution": "1 m | 3.28 ft",
        "Outputs": "Present and past weather | Mist | Fog | Drizzle | Freezing drizzle | Drizzle and"
      },
      "OPTICAL / PULSE": {
        "Emitter Light Frequency": "850 nm",
        "Operating Humidity Range": "0 to 100%",
        "Sensor Sealing": "Rated to IP66",
        "Wind Speed": "Up to 60 m/s"
      },
      "ELECTRICAL / HEATERS / INTERFACE": {
        "DSP & Dew Heaters Power": "2 x 0.6 W | Total: 1.2 W",
        "Hood Heater Supply Voltage": "24 V dc or ac",
        "Hood Heater Power": "2 x 30 W | Total: 60 W",
        "Serial Interface": "RS-232 or RS-485",
        "Serial Data Rates": "1200 to 115,200 bps | Default: 38,400 bps",
        "Alarm Outputs": "2 x 0 to 5 V outputs | 32 mA max"
      }
    }
  },
  {
    "id": "CSI_CS120A_ST",
    "model": "CS120A-ST",
    "name": "CS120A Atmospheric Visibility Sensor -ST -25 t",
    "category": "Sensors",
    "subcategory": "Visibility Sensors",
    "deviceType": "Visibility Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/9003",
    "productUrl": "https://www.campbellsci.com/products/cs120a",
    "specs": {
      "General": {
        "Model": "CS120A-ST",
        "Category": "Sensors",
        "Subcategory": "Visibility Sensors",
        "Device Type": "Visibility Sensor"
      },
      "Measurements": {
        "Supported": "Visibility"
      },
      "CONFIGURATION": {
        "Base Model": "CS120A",
        "Temperature Version": "ST",
        "Configuration Description": "CS120A | Temperature version: ST | Operating temperature: -25° to +60°C",
        "Cable Length Options": "5 m (17 ft) per sensor | 10 m (33 ft) per sensor | 15 m (50 ft) per sensor | 30 ",
        "Warranty": "2 years"
      },
      "ENVIRONMENTAL": {
        "Operating Temperature Range": "-25° to +60°C"
      },
      "GENERAL / OPERATIONAL SPECIFICATIONS": {
        "Signal Type/Output": "RS-232 | RS-485",
        "Measurement Description": "Meteorological Observable Range (MOR)",
        "Maximum Reported Visibility": "100 km | 62.1 mi",
        "Minimum Reported Visibility": "5 m | 16.4 ft",
        "Accuracy": "< 600 m (< 1968.5 ft): ±8% | 600 to 10,000 m (1968.5 to 32,808.4 ft): ±10% | 10,",
        "Resolution": "1 m | 3.3 ft"
      },
      "OPTICAL / PULSE": {
        "LED Center Wavelength": "850 nm",
        "LED Spectral Bandwidth": "±35 nm",
        "Light Pulse Rate": "1 kHz",
        "Operating Humidity Range": "0 to 100%",
        "Sensor Sealing": "Rated to IP66",
        "Wind Speed": "Up to 60 m/s"
      },
      "ELECTRICAL / HEATERS / INTERFACE": {
        "DSP & Dew Heaters Power": "2 x 0.6 W | Total: 1.4 W for dew heater",
        "Typical Current Consumption @ 12 Vdc": "Dew heaters active + RS-232 communications: 200 mA | Continuous sampling + dew h",
        "Hood Heater Supply Voltage": "24 V dc or ac",
        "Hood Heater Power": "2 x 30 W | Total: 60 W",
        "Serial Interface": "RS-232 or RS-485 | 8 bit data bytes | 1 stop bit",
        "Serial Data Rates": "1200 to 115,200 bps | Default: 38,400 bps"
      }
    }
  },
  {
    "id": "CSI_CS511",
    "model": "CS511",
    "name": "Sensorex DO6400 T Dissolved Oxygen Sensor (0 to +50C)",
    "category": "Sensors",
    "subcategory": "Dissolved Oxygen Sensors",
    "deviceType": "Dissolved Oxygen Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/5553",
    "productUrl": "https://www.campbellsci.com/products/cs511",
    "specs": {
      "General": {
        "Model": "CS511",
        "Category": "Sensors",
        "Subcategory": "Dissolved Oxygen Sensors",
        "Device Type": "Dissolved Oxygen Sensor"
      },
      "Measurements": {
        "Supported": "Dissolved Oxygen"
      },
      "SPECIFICATIONS": {
        "Operating Temperature Range": "0° to 50°C",
        "Measurement Range": "0.5 to 50 ppm (for O₂)",
        "Accuracy": "±2%",
        "Output": "33 mV ± 9 mV (100% saturation) | < 2 mV (0% saturation)",
        "Response Time": "5 min from 100% to 0% oxygen",
        "Minimum Water Velocity": "5 cm s⁻¹ (2 in. s⁻¹) across membrane"
      }
    }
  },
  {
    "id": "CSI_CLARIVUE10",
    "model": "ClariVue10",
    "name": "ClariVUE™ 10",
    "category": "Sensors",
    "subcategory": "Turbidity Sensors",
    "deviceType": "Turbidity Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/13165",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "ClariVue10",
        "Category": "Sensors",
        "Subcategory": "Turbidity Sensors",
        "Device Type": "Turbidity Sensor"
      },
      "Measurements": {
        "Supported": "Temperature, Turbidity"
      },
      "General Specifications": {
        "Standards": "Meets ISO 7027-1:2016 (side scatter) standard for turbidity measurements",
        "Signal type": "SDI-12 v1.4",
        "Operating temperature range": "−2 to 40 °C",
        "Power requirements": "9.6 to 18 VDC",
        "Power consumption – Idle": "<300 µA",
        "Power consumption – Measurement": "<35 mA"
      }
    }
  },
  {
    "id": "CSI_RANGEVUE30",
    "model": "RangeVue30",
    "name": "RangeVue™30",
    "category": "Sensors",
    "subcategory": "Water Level, Stage, and Flow Sensors",
    "deviceType": "Water Level, Stage, and Flow Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/14971",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "RangeVue30",
        "Category": "Sensors",
        "Subcategory": "Water Level, Stage, and Flow Sensors",
        "Device Type": "Water Level, Stage, and Flow Sensor"
      },
      "Measurements": {
        "Supported": "Water Level, Distance"
      },
      "General Specifications": {
        "Product Type": "SDI-12 Radar Water-Level Sensor",
        "Manufacturer": "Campbell Scientific, Inc.",
        "Device Classification": "Primary measurement device / sensor",
        "Product Family": "RangeVue Series",
        "Primary Application": "Non-contact monitoring of water level in rivers, lakes, tidal seas, and reservoi",
        "Measurement Principle": "Continuous frequency-modulated 80 GHz radar; measures elapsed time between emitt"
      }
    }
  },
  {
    "id": "CSI_CS616",
    "model": "CS616",
    "name": "Water Content Reflectometer (0 to +70C)**",
    "category": "Sensors",
    "subcategory": "Soil Moisture, Temperature, and EC Sensors",
    "deviceType": "Soil Moisture, Temperature, and EC Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4885",
    "productUrl": "https://www.campbellsci.com/products/cs616-reflectometer",
    "specs": {
      "General": {
        "Model": "CS616",
        "Category": "Sensors",
        "Subcategory": "Soil Moisture, Temperature, and EC Sensors",
        "Device Type": "Soil Moisture, Temperature, and EC Sensor"
      },
      "Measurements": {
        "Supported": "Volumetric Water Content"
      },
      "SPECIFICATIONS": {
        "Measurements Made": "Volumetric water content (VWC) of porous media (such as soil)",
        "Measurement Range": "0% to saturation",
        "Water Content Accuracy": "±2.5% VWC (using standard calibration with bulk EC of ≤ 0.5 dS m⁻¹, bulk density",
        "Required Equipment": "Measurement system",
        "Soil Suitability": "Long rods and lower frequency are well-suited for soft soil with low electrical ",
        "Rods": "Not replaceable"
      },
      "Current Drain": {
        "Current Drain": "65 mA @ 12 Vdc (when enabled) | 45 μA (quiescent typical)"
      }
    }
  },
  {
    "id": "CSI_CS650",
    "model": "CS650",
    "name": "30CM Water Content Reflectometer plus",
    "category": "Sensors",
    "subcategory": "Soil Moisture, Temperature, and EC Sensors",
    "deviceType": "Soil Moisture, Temperature, and EC Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4884",
    "productUrl": "https://www.campbellsci.com/products/cs650",
    "specs": {
      "General": {
        "Model": "CS650",
        "Category": "Sensors",
        "Subcategory": "Soil Moisture, Temperature, and EC Sensors",
        "Device Type": "Soil Moisture, Temperature, and EC Sensor"
      },
      "Measurements": {
        "Supported": "Soil Temperature, Volumetric Water Content, Soil Electrical Conductivity, Dielectric Permittivity"
      },
      "SPECIFICATIONS": {
        "Measurements Made": "Soil electrical conductivity (EC), relative dielectric permittivity, volumetric ",
        "Required Equipment": "Measurement system",
        "Soil Suitability": "Long rods with large sensing volume (> 6 L) are suitable for soils with low to m",
        "Rods": "Not replaceable",
        "Sensors": "Not interchangeable",
        "Sensing Volume": "7800 cm³ (~7.5 cm radius around each probe rod and 4.5 cm beyond the end of the "
      },
      "Current Drain": {
        "Active (3 ms)": "80 mA (@ 6 Vdc) | 45 mA typical (@ 12 Vdc) | 35 mA (@ 18 Vdc)",
        "Quiescent": "135 µA typical (@ 12 Vdc)"
      },
      "Electrical Conductivity": {
        "Range for Solution EC": "0 to 3 dS/m",
        "Range for Bulk EC": "0 to 3 dS/m",
        "Accuracy": "±(5% of reading + 0.05 dS/m)",
        "Precision": "0.5% of BEC"
      },
      "Relative Dielectric Permittivity": {
        "Range": "1 to 81",
        "Accuracy": "±(2% of reading + 0.6) from 1 to 40 for solution EC ≤ 3 dS/m | ±1.4 (from 40 to ",
        "Precision": "< 0.02"
      },
      "Volumetric Water Content": {
        "Range": "0 to 100% (with M4 command)",
        "Water Content Accuracy": "±3% (typical with factory VWC model) where solution EC < 3 dS/m | ±1% (with soil",
        "Precision": "< 0.05%"
      },
      "Soil Temperature": {
        "Range": "-50° to +70°C",
        "Resolution": "0.001°C",
        "Accuracy": "±0.1°C (for typical soil temperatures [0 to 40°C] when probe body is buried in s",
        "Precision": "±0.02°C"
      }
    }
  },
  {
    "id": "CSI_CS655",
    "model": "CS655",
    "name": "12cm Water Content Reflectometer Plus (-50 to +70C)**",
    "category": "Sensors",
    "subcategory": "Soil Moisture, Temperature, and EC Sensors",
    "deviceType": "Soil Moisture, Temperature, and EC Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4883",
    "productUrl": "https://www.campbellsci.com/products/cs655",
    "specs": {
      "General": {
        "Model": "CS655",
        "Category": "Sensors",
        "Subcategory": "Soil Moisture, Temperature, and EC Sensors",
        "Device Type": "Soil Moisture, Temperature, and EC Sensor"
      },
      "Measurements": {
        "Supported": "Soil Temperature, Volumetric Water Content, Soil Electrical Conductivity, Dielectric Permittivity"
      },
      "SPECIFICATIONS": {
        "Measurements Made": "Soil electrical conductivity (EC), relative dielectric permittivity, volumetric ",
        "Required Equipment": "Measurement system",
        "Soil Suitability": "Short rods are easy to install in hard soil. Suitable for soils with higher elec",
        "Rods": "Not replaceable",
        "Sensors": "Not interchangeable",
        "Sensing Volume": "3600 cm³ (~7.5 cm radius around each probe rod and 4.5 cm beyond the end of the "
      },
      "Current Drain": {
        "Active (3 ms)": "80 mA (@ 6 Vdc) | 45 mA typical (@ 12 Vdc) | 35 mA (@ 18 Vdc)",
        "Quiescent": "135 µA typical (@ 12 Vdc)"
      },
      "Electrical Conductivity": {
        "Range for Solution EC": "0 to 8 dS/m",
        "Range for Bulk EC": "0 to 8 dS/m",
        "Accuracy": "±(5% of reading + 0.05 dS/m)",
        "Precision": "0.5% of BEC"
      },
      "Relative Dielectric Permittivity": {
        "Range": "1 to 81",
        "Accuracy": "±(3% of reading + 0.8) from 1 to 40 for solution EC ≤ 8 dS/m | ±2 (from 40 to 81",
        "Precision": "< 0.02"
      },
      "Volumetric Water Content": {
        "Range": "0 to 100% (with M4 command)",
        "Water Content Accuracy": "±3% (typical with factory VWC model) where solution EC < 10 dS/m | ±1% (with soi",
        "Precision": "< 0.05%"
      },
      "Soil Temperature": {
        "Range": "-50° to +70°C",
        "Resolution": "0.001°C",
        "Accuracy": "±0.1°C (for typical soil temperatures [0 to 40°C] when probe body is buried in s",
        "Precision": "±0.02°C"
      }
    }
  },
  {
    "id": "CSI_SOILVUE10_5",
    "model": "SoilVue10-5",
    "name": "SoilVue10 TDR Soil Moisture Profile Sensor, 0.5m",
    "category": "Sensors",
    "subcategory": "Soil Moisture, Temperature, and EC Sensors",
    "deviceType": "Soil Moisture, Temperature, and EC Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/11468",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "SoilVue10-5",
        "Category": "Sensors",
        "Subcategory": "Soil Moisture, Temperature, and EC Sensors",
        "Device Type": "Soil Moisture, Temperature, and EC Sensor"
      },
      "Measurements": {
        "Supported": "Soil Temperature, Volumetric Water Content, Dielectric Permittivity"
      },
      "General Specifications": {
        "Product Name": "SoilVue™10",
        "Product Variant": "0.5 m option",
        "Product Type": "Complete Soil Profiler / TDR Soil Moisture and Temperature Profile Sensor",
        "Manufacturer": "Campbell Scientific, Inc.",
        "Measurement Technology": "Campbell TrueWave™ TDR",
        "Measurements Made": "Volumetric water content (VWC), permittivity, electrical conductivity (EC), and "
      }
    }
  },
  {
    "id": "CSI_LWS",
    "model": "LWS",
    "name": "Meter Phytos 31 Leaf Wetness Sensor",
    "category": "Sensors",
    "subcategory": "Leaf Wetness Sensors",
    "deviceType": "Leaf Wetness Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/238",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "LWS",
        "Category": "Sensors",
        "Subcategory": "Leaf Wetness Sensors",
        "Device Type": "Leaf Wetness Sensor"
      },
      "Measurements": {
        "Supported": "Leaf Wetness"
      },
      "General Specifications": {
        "Product Type": "Dielectric Leaf Wetness Sensor",
        "Device Classification": "Primary measurement device / leaf-wetness sensor",
        "Primary Application": "Detection and estimation of leaf surface wetness, frost, and moisture in plant c",
        "Measurement Principle": "Measures the dielectric constant near the upper sensor surface; output varies wi",
        "Measurement Description": "Dry, frosted, wet",
        "Signal Type / Output": "Analog voltage"
      }
    }
  },
  {
    "id": "CSI_SNOWVUE10",
    "model": "SnowVue10",
    "name": "Digital Snow Depth Sensor (-45 to +50C) w/o Cable",
    "category": "Sensors",
    "subcategory": "Snow Water Equivalent / Snow Depth Sensors",
    "deviceType": "Snow Water Equivalent / Snow Depth Sensor",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/13938",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "SnowVue10",
        "Category": "Sensors",
        "Subcategory": "Snow Water Equivalent / Snow Depth Sensors",
        "Device Type": "Snow Water Equivalent / Snow Depth Sensor",
        "Product Name": "SnowVue™10",
        "Product Type": "Digital Snow-Depth Sensor / Sonic Ranging Sensor"
      },
      "Measurements": {
        "Supported": "Distance, Snow Depth"
      }
    }
  },
  {
    "id": "CSI_AVW200_ST",
    "model": "AVW200-ST",
    "name": "AVW200 2-Channel Vibrating Wire Spectrum Analyzer",
    "category": "Measurement Devices",
    "subcategory": "Vibrating Wire Analyzers",
    "deviceType": "Vibrating Wire Analyzer",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4132",
    "productUrl": "https://www.campbellsci.com/products/avw200",
    "specs": {
      "General": {
        "Model": "AVW200-ST",
        "Category": "Measurement Devices",
        "Subcategory": "Vibrating Wire Analyzers",
        "Device Type": "Vibrating Wire Analyzer"
      },
      "GENERAL SPECIFICATIONS": {
        "Measurement Speed": "AVW200 vibrating-wire measurement and half-bridge thermistor measurement combine",
        "DF Measurement Time": "Selectable frequency range: 1.4 to 1.6 s",
        "Half-Bridge Thermistor Measurement Time": "60 ms or 70 ms depending on integration time selected",
        "Thermistor Integration Time": "20 ms (50 Hz) or 16.66 ms (60 Hz) with positive excitation, followed by 20 ms or"
      },
      "VIBRATING-WIRE INPUTS": {
        "Description": "Differential Coil+ (V+) and Coil− (V−) outputs/inputs for direct connection, exc",
        "Excitation Voltage": "±2.5 V (5 V peak-to-peak) or ±6 V (12 V peak-to-peak), logarithmic sine wave",
        "Excitation Frequency Range": "100 Hz to 6.5 kHz",
        "Basic Resolution": "24-bit",
        "Input Voltage Range": "±250 mV differential",
        "Measurement Resolution": "0.001 Hz RMS, from -55°C to +85°C"
      },
      "THERMISTOR INPUTS": {
        "Description": "Half-bridge ratiometric measurement; returned value is in ohms and can be used f",
        "Basic Resolution": "24-bit",
        "Input Voltage Range": "±2500 mV single-ended",
        "Measurement Resolution": "0.001 Ω RMS, from -55°C to +85°C",
        "Accuracy": "±0.25% of reading, from -55°C to +85°C",
        "Input Resistance": "5 kΩ for thermistor input T−; 5 kΩ, 0.1% completion resistor"
      },
      "DIGITAL CONTROL PORTS": {
        "Description": "Three digital control ports, C1 to C3",
        "C1 Function": "SDI-12 I/O communication port",
        "C2 Function": "Clock output for multiplexer control",
        "C3 Function": "Reset output for multiplexer control",
        "Input State High": "2.5 to 5.3 V",
        "Input State Low": "-0.3 to 1.0 V"
      },
      "COMMUNICATION": {
        "RS-232": "Non-isolated",
        "Baud Rates": "Selectable from 1200 to 38.4 kbps",
        "RS-232 Protocol": "ASCII; one start bit, one stop bit, eight data bits, no parity",
        "SDI-12": "Control Port 1 configured for SDI-12 sensor asynchronous communication; meets SD"
      },
      "SYSTEM": {
        "Program Execution Interval": "1 s",
        "Processor": "Hitachi H8S 2334, 16-bit CPU with 32-bit internal core",
        "Memory": "128 or 512 kB SRAM; 2 MB OS Flash",
        "Clock Accuracy": "±10 minutes per month; synchronized with data logger clock every execution inter"
      },
      "CE COMPLIANCE": {
        "Standard": "IEC 61326:2002"
      },
      "POWER REQUIREMENTS": {
        "Voltage": "9.6 to 32 Vdc",
        "Typical Current Drain — Quiescent, Radio Off": "Approximately 0.3 mA at 12 Vdc",
        "Typical Current Drain — Radio Duty Cycling": "Approximately 3 mA at 12 Vdc, 1 s duty cycle including quiescent current",
        "Typical Current Drain — Radio Always On": "Approximately 26 mA at 12 Vdc; radio transmit current 100 mA",
        "Typical Current Drain — Active RS-232 Communication": "Approximately 6 mA at 12 Vdc; approximately 3 s after communication stops, curre",
        "Typical Current Drain — Measurement": "Approximately 25 mA averaged over 2 s"
      },
      "OPERATING TEMPERATURE RANGE": {
        "Operating Temperature Range": "-25°C to +50°C, standard"
      },
      "PHYSICAL": {
        "Dimensions": "21.6 × 11.18 × 3.18 cm (8.5 × 4.5 × 1.2 in.)",
        "Weight": "0.43 kg (0.95 lb)"
      },
      "WARRANTY": {
        "Warranty": "One year against defects in materials and workmanship"
      }
    }
  },
  {
    "id": "CSI_CR310_NA",
    "model": "CR310-NA",
    "name": "CR310 Datalogger (-40 to +70C) -NA No Additional Co",
    "category": "Measurement Devices",
    "subcategory": "Data Loggers",
    "deviceType": "Data Logger",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/11631",
    "productUrl": "https://www.campbellsci.com/products/cr310",
    "specs": {
      "General": {
        "Model": "CR310-NA",
        "Category": "Measurement Devices",
        "Subcategory": "Data Loggers",
        "Device Type": "Data Logger"
      },
      "Measurements": {
        "Supported": "Temperature"
      },
      "CONFIGURATION": {
        "Variant Code Suffix": "NA",
        "Communication Family": "NA",
        "Configuration Description": "No Additional Coms"
      },
      "PRODUCT PAGE SUMMARY": {
        "Operating Temperature Range - Product Page": "-40° to +70°C (standard)",
        "Maximum Scan Rate - Product Page": "10 Hz",
        "Analog Inputs - Product Page": "6 single-ended or 3 differential (individually configured)",
        "Communications Ports - Product Page": "USB Micro-B | RS-232 | 10/100 Ethernet RJ45",
        "Dimensions - Product Page": "16.26 x 7.62 x 5.68 cm (6.4 x 3.0 x 2.2 in.)",
        "Weight / Mass": "288 g (0.64 lb)"
      },
      "SOURCE / CONFIGURATION": {
        "Primary Specification Source": "CR300-Series Specifications, Revision 05/2026",
        "Base Model": "CR310",
        "Electrical Specification Validity": "-40° to +70°C, non-condensing environment, unless otherwise specified",
        "Recalibration Recommendation": "Every three years"
      },
      "SYSTEM SPECIFICATIONS": {
        "Processor": "ARM Cortex M4 running at 144 MHz",
        "CPU Drive": "80 MB serial flash",
        "Data Storage Memory": "30 MB serial flash",
        "Operating System Memory": "2 MB flash",
        "Settings / Calibration / TLS / System Information Memory": "3 MB serial flash",
        "Background Tasks / Buffers / Variables Memory": "756 KB RAM"
      },
      "PHYSICAL SPECIFICATIONS": {
        "Dimensions - CR310 (Specification Sheet)": "16.3 x 8.4 x 5.6 cm (6.4 x 3.3 x 2.2 in.) | Additional clearance required for ca",
        "Case Material": "Powder-coated aluminum"
      },
      "POWER REQUIREMENTS": {
        "Power Input Protection": "Protected against surge, over-voltage, over-current, and reverse power | IEC 610",
        "Charge Terminal (CHG+ / CHG-) - Input": "Input from power converter or solar panel",
        "Charge Terminal - Energy Source": "ES1 PS2 energy sources only",
        "Charge Terminal - Voltage": "16 to 32 VDC",
        "Charge Terminal - Hold Current Limit": "1.6 A @ 20°C",
        "Battery Terminal (BAT+ / BAT-) - Input": "Input from external battery, 7 Ah lead-acid typical"
      },
      "POWER OUTPUT SPECIFICATIONS": {
        "System Power Out Current Limit @ -40°C": "5.8 A",
        "System Power Out Current Limit @ 20°C": "3.7 A",
        "System Power Out Current Limit @ 70°C": "2.0 A",
        "VX Terminals": "Two independently configurable voltage terminals (VX1-VX2) | 12-bit DAC | Can pr",
        "VX Range": "150 to 5000 mV",
        "VX Resolution": "1.6 mV"
      },
      "ANALOG MEASUREMENT SPECIFICATIONS": {
        "Analog Input Configuration": "6 single-ended (SE) or 3 differential (DIFF) terminals | Individually configurab",
        "Differential Terminals": "DIFF 1H/1L – 3H/3L",
        "Single-Ended Terminals": "SE1 – SE6",
        "Input Resistance @ fN1 50/60 Hz": "5 GΩ typical",
        "Input Resistance @ fN1 4000 Hz": "300 MΩ typical",
        "Input Voltage Limits": "-100 to +2500 mV"
      },
      "RESISTANCE MEASUREMENT SPECIFICATIONS": {
        "Resistance Measurement Description": "Ratiometric-resistance measurements for four- and six-wire full-bridge circuits ",
        "Resistance Accuracy @ 0 to 40°C": "±(0.05% of voltage measurement + offset)",
        "Resistance Accuracy @ -40 to 70°C": "±(0.06% of voltage measurement + offset)"
      },
      "PERIOD-AVERAGING MEASUREMENT SPECIFICATIONS": {
        "Period-Averaging Terminals": "SE1-SE4",
        "Period-Averaging Accuracy": "±(0.01% of measurement + resolution) | Resolution = 0.13 µs divided by number of",
        "Period-Averaging Voltage Range": "0 to 3.3 V",
        "Period-Averaging Minimum Pulse Width": "2.5 µs",
        "Period-Averaging Voltage Threshold": "Counts cycles on transition from <0.9 VDC to >2.1 VDC"
      },
      "CURRENT-LOOP MEASUREMENT SPECIFICATIONS": {
        "Current-Loop Description": "Two analog input terminals can be configured as independent, non-isolated 0-20 m",
        "Current-Loop Terminals": "SE1-SE2",
        "Current-Loop Range": "0 to 25 mA",
        "Current-Loop Accuracy @ 0 to 40°C": "±0.14% of reading",
        "Current-Loop Accuracy @ -40 to 70°C": "±0.26% of reading"
      },
      "PULSE MEASUREMENT SPECIFICATIONS": {
        "Switch-Closure Terminals": "P_SW | C1-C2 (requires external 100 kΩ resistor from terminal to VX1 or VX2)",
        "Switch-Closure Maximum Input Frequency": "150 Hz",
        "Switch-Closure Minimum Switch Closed Time": "3 ms",
        "Switch-Closure Minimum Switch Open Time": "3 ms",
        "Switch-Closure Maximum Bounce Time": "1 ms open without being counted",
        "High-Frequency Input Terminals": "SE1-SE4 | P_LL | P_SW | C1-C2"
      },
      "DIGITAL INPUT/OUTPUT SPECIFICATIONS": {
        "Digital I/O Terminals": "SE1-SE4 | P_SW | C1-C2",
        "Digital I/O Voltage Levels - C1/C2": "High: 5.0 V output / 3.3 V input | Low: 0 V | Current source: 10 mA at 3.5 V | M",
        "Digital I/O Voltage Levels - SE1/SE2": "High: 3.3 V | Low: 0 V | Current source: 100 µA at 3.0 V | Maximum input voltage",
        "Digital I/O Voltage Levels - SE3/SE4/P_SW": "High: 3.3 V | Low: 0 V | Current source: 100 µA at 3.0 V | Maximum input voltage",
        "PWM Terminals": "SE1-SE4",
        "PWM Period Maximum": "2047 ms"
      },
      "COMMUNICATIONS SPECIFICATIONS": {
        "Ethernet Port": "CR310 only | RJ45 jack | 10/100Base Mbps | Full and half duplex | Auto-MDIX | Ma",
        "Internet Protocols": "Ethernet | PPP | RNDIS | ICMP/Ping | Auto-IP (APIPA) | IPv4 | IPv6 | UDP | TCP |",
        "Additional Protocols": "PakBus | PakBus Encryption | SDI-12 | Modbus RTU / ASCII / TCP | DNP3 outstation",
        "USB Device": "Micro-B device for computer connectivity",
        "SDI-12": "C1 and C2 | Two independent SDI-12 compliant terminals | Meet SDI-12 Standard v1"
      },
      "STANDARDS COMPLIANCE SPECIFICATIONS": {
        "Shock and Vibration": "ASTM D4169",
        "Protection": "IP30",
        "EMI/ESD - ESD Immunity": "IEC 61000-4-2 | ±15 kV air | ±8 kV contact discharge",
        "EMI/ESD - Radiated RF Immunity": "IEC 61000-4-3 | 10 V/m, 80-1000 MHz",
        "EMI/ESD - EFT Immunity": "IEC 61000-4-4 | 4 kV power | 4 kV I/O",
        "EMI/ESD - Surge Immunity": "IEC 61000-4-5 | 4 kV power | 4 kV I/O"
      },
      "TERMINAL FUNCTIONS": {
        "Analog Input Function - Single-Ended Voltage": "SE1-SE6",
        "Analog Input Function - Differential Voltage": "DIFF 1H/1L, 2H/2L, 3H/3L",
        "Analog Input Function - Ratiometric/Bridge": "SE1-SE6",
        "Analog Input Function - Thermocouple": "SE1-SE6",
        "Analog Input Function - Current Loop": "SE1-SE2",
        "Pulse Function - Switch-Closure": "C1, C2, P_SW"
      }
    }
  },
  {
    "id": "CSI_CR310_WIFI",
    "model": "CR310-WIFI",
    "name": "CR310 Datalogger (-40 to +70C) -WIFI w/Wireless M",
    "category": "Measurement Devices",
    "subcategory": "Data Loggers",
    "deviceType": "Data Logger",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/9350",
    "productUrl": "https://www.campbellsci.com/products/cr310",
    "specs": {
      "General": {
        "Model": "CR310-WIFI",
        "Category": "Measurement Devices",
        "Subcategory": "Data Loggers",
        "Device Type": "Data Logger"
      },
      "Measurements": {
        "Supported": "Temperature"
      },
      "CONFIGURATION": {
        "Variant Code Suffix": "WIFI",
        "Communication Family": "WIFI",
        "Configuration Description": "w/Wireless Modem"
      },
      "PRODUCT PAGE SUMMARY": {
        "Operating Temperature Range - Product Page": "-40° to +70°C (standard)",
        "Maximum Scan Rate - Product Page": "10 Hz",
        "Analog Inputs - Product Page": "6 single-ended or 3 differential (individually configured)",
        "Communications Ports - Product Page": "USB Micro-B | RS-232 | 10/100 Ethernet RJ45",
        "Dimensions - Product Page": "16.26 x 7.62 x 5.68 cm (6.4 x 3.0 x 2.2 in.)",
        "Weight / Mass": "306 g (0.68 lb)"
      },
      "SOURCE / CONFIGURATION": {
        "Primary Specification Source": "CR300-Series Specifications, Revision 05/2026",
        "Base Model": "CR310",
        "Electrical Specification Validity": "-40° to +70°C, non-condensing environment, unless otherwise specified",
        "Recalibration Recommendation": "Every three years"
      },
      "SYSTEM SPECIFICATIONS": {
        "Processor": "ARM Cortex M4 running at 144 MHz",
        "CPU Drive": "80 MB serial flash",
        "Data Storage Memory": "30 MB serial flash",
        "Operating System Memory": "2 MB flash",
        "Settings / Calibration / TLS / System Information Memory": "3 MB serial flash",
        "Background Tasks / Buffers / Variables Memory": "756 KB RAM"
      },
      "PHYSICAL SPECIFICATIONS": {
        "Dimensions - CR310 (Specification Sheet)": "16.3 x 8.4 x 5.6 cm (6.4 x 3.3 x 2.2 in.) | Additional clearance required for ca",
        "Case Material": "Powder-coated aluminum"
      },
      "POWER REQUIREMENTS": {
        "Power Input Protection": "Protected against surge, over-voltage, over-current, and reverse power | IEC 610",
        "Charge Terminal (CHG+ / CHG-) - Input": "Input from power converter or solar panel",
        "Charge Terminal - Energy Source": "ES1 PS2 energy sources only",
        "Charge Terminal - Voltage": "16 to 32 VDC",
        "Charge Terminal - Hold Current Limit": "1.6 A @ 20°C",
        "Battery Terminal (BAT+ / BAT-) - Input": "Input from external battery, 7 Ah lead-acid typical"
      },
      "POWER OUTPUT SPECIFICATIONS": {
        "System Power Out Current Limit @ -40°C": "5.8 A",
        "System Power Out Current Limit @ 20°C": "3.7 A",
        "System Power Out Current Limit @ 70°C": "2.0 A",
        "VX Terminals": "Two independently configurable voltage terminals (VX1-VX2) | 12-bit DAC | Can pr",
        "VX Range": "150 to 5000 mV",
        "VX Resolution": "1.6 mV"
      },
      "ANALOG MEASUREMENT SPECIFICATIONS": {
        "Analog Input Configuration": "6 single-ended (SE) or 3 differential (DIFF) terminals | Individually configurab",
        "Differential Terminals": "DIFF 1H/1L – 3H/3L",
        "Single-Ended Terminals": "SE1 – SE6",
        "Input Resistance @ fN1 50/60 Hz": "5 GΩ typical",
        "Input Resistance @ fN1 4000 Hz": "300 MΩ typical",
        "Input Voltage Limits": "-100 to +2500 mV"
      },
      "RESISTANCE MEASUREMENT SPECIFICATIONS": {
        "Resistance Measurement Description": "Ratiometric-resistance measurements for four- and six-wire full-bridge circuits ",
        "Resistance Accuracy @ 0 to 40°C": "±(0.05% of voltage measurement + offset)",
        "Resistance Accuracy @ -40 to 70°C": "±(0.06% of voltage measurement + offset)"
      },
      "PERIOD-AVERAGING MEASUREMENT SPECIFICATIONS": {
        "Period-Averaging Terminals": "SE1-SE4",
        "Period-Averaging Accuracy": "±(0.01% of measurement + resolution) | Resolution = 0.13 µs divided by number of",
        "Period-Averaging Voltage Range": "0 to 3.3 V",
        "Period-Averaging Minimum Pulse Width": "2.5 µs",
        "Period-Averaging Voltage Threshold": "Counts cycles on transition from <0.9 VDC to >2.1 VDC"
      },
      "CURRENT-LOOP MEASUREMENT SPECIFICATIONS": {
        "Current-Loop Description": "Two analog input terminals can be configured as independent, non-isolated 0-20 m",
        "Current-Loop Terminals": "SE1-SE2",
        "Current-Loop Range": "0 to 25 mA",
        "Current-Loop Accuracy @ 0 to 40°C": "±0.14% of reading",
        "Current-Loop Accuracy @ -40 to 70°C": "±0.26% of reading"
      },
      "PULSE MEASUREMENT SPECIFICATIONS": {
        "Switch-Closure Terminals": "P_SW | C1-C2 (requires external 100 kΩ resistor from terminal to VX1 or VX2)",
        "Switch-Closure Maximum Input Frequency": "150 Hz",
        "Switch-Closure Minimum Switch Closed Time": "3 ms",
        "Switch-Closure Minimum Switch Open Time": "3 ms",
        "Switch-Closure Maximum Bounce Time": "1 ms open without being counted",
        "High-Frequency Input Terminals": "SE1-SE4 | P_LL | P_SW | C1-C2"
      },
      "DIGITAL INPUT/OUTPUT SPECIFICATIONS": {
        "Digital I/O Terminals": "SE1-SE4 | P_SW | C1-C2",
        "Digital I/O Voltage Levels - C1/C2": "High: 5.0 V output / 3.3 V input | Low: 0 V | Current source: 10 mA at 3.5 V | M",
        "Digital I/O Voltage Levels - SE1/SE2": "High: 3.3 V | Low: 0 V | Current source: 100 µA at 3.0 V | Maximum input voltage",
        "Digital I/O Voltage Levels - SE3/SE4/P_SW": "High: 3.3 V | Low: 0 V | Current source: 100 µA at 3.0 V | Maximum input voltage",
        "PWM Terminals": "SE1-SE4",
        "PWM Period Maximum": "2047 ms"
      },
      "COMMUNICATIONS SPECIFICATIONS": {
        "Ethernet Port": "CR310 only | RJ45 jack | 10/100Base Mbps | Full and half duplex | Auto-MDIX | Ma",
        "Internet Protocols": "Ethernet | PPP | RNDIS | ICMP/Ping | Auto-IP (APIPA) | IPv4 | IPv6 | UDP | TCP |",
        "Additional Protocols": "PakBus | PakBus Encryption | SDI-12 | Modbus RTU / ASCII / TCP | DNP3 outstation",
        "USB Device": "Micro-B device for computer connectivity",
        "SDI-12": "C1 and C2 | Two independent SDI-12 compliant terminals | Meet SDI-12 Standard v1"
      },
      "STANDARDS COMPLIANCE SPECIFICATIONS": {
        "Shock and Vibration": "ASTM D4169",
        "Protection": "IP30",
        "EMI/ESD - ESD Immunity": "IEC 61000-4-2 | ±15 kV air | ±8 kV contact discharge",
        "EMI/ESD - Radiated RF Immunity": "IEC 61000-4-3 | 10 V/m, 80-1000 MHz",
        "EMI/ESD - EFT Immunity": "IEC 61000-4-4 | 4 kV power | 4 kV I/O",
        "EMI/ESD - Surge Immunity": "IEC 61000-4-5 | 4 kV power | 4 kV I/O"
      },
      "TERMINAL FUNCTIONS": {
        "Analog Input Function - Single-Ended Voltage": "SE1-SE6",
        "Analog Input Function - Differential Voltage": "DIFF 1H/1L, 2H/2L, 3H/3L",
        "Analog Input Function - Ratiometric/Bridge": "SE1-SE6",
        "Analog Input Function - Thermocouple": "SE1-SE6",
        "Analog Input Function - Current Loop": "SE1-SE2",
        "Pulse Function - Switch-Closure": "C1, C2, P_SW"
      },
      "WI-FI OPTION SPECIFICATIONS": {
        "Maximum Possible Over-the-Air Data Rates": "<11 Mbps over 802.11b | <54 Mbps over 802.11g | <72 Mbps over 802.11n",
        "Operating Frequency": "2.4 GHz, 20 MHz bandwidth",
        "Antenna Connector": "Reverse Polarity SMA (RPSMA)",
        "Antenna": "Unity gain (0 dBd), 1/2 wave whip, omnidirectional | Articulating knuckle joint ",
        "Supported Technologies": "802.11 b/g/n | WPA/WPA2-Personal | WPA/WPA2-Enterprise Security | WEP",
        "Client Mode": "WPA/WPA2-Personal and Enterprise | WEP"
      }
    }
  },
  {
    "id": "CSI_CR350_NA",
    "model": "CR350-NA",
    "name": "CR350 Datalogger (-40 to +70C) -NA No Additional Co",
    "category": "Measurement Devices",
    "subcategory": "Data Loggers",
    "deviceType": "Data Logger",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/13645",
    "productUrl": "https://www.campbellsci.com/products/cr350",
    "specs": {
      "General": {
        "Model": "CR350-NA",
        "Category": "Measurement Devices",
        "Subcategory": "Data Loggers",
        "Device Type": "Data Logger"
      },
      "CONFIGURATION": {
        "Variant Code Suffix": "NA",
        "Communication Family": "NA",
        "Configuration Description": "No Additional Coms"
      },
      "GENERAL SPECIFICATIONS": {
        "Model": "CR350",
        "Product Type": "Measurement and Control Datalogger",
        "Operating Temperature Range": "Environment: Non-condensing | Range: -40° to +70°C",
        "Maximum Scan Rate": "10 Hz",
        "Case Material": "High-impact-resistant polycarbonate, recycle code 7",
        "Analog Inputs": "4 single-ended or 2 differential (individually configured)"
      },
      "POWER / CLOCK / MEMORY": {
        "Charge Terminal Characteristics (CHG+ and CHG-)": "Input: Power converter or solar panel, typical | Energy source: ES1 PS2 only | H",
        "Battery Terminal Characteristics (BAT+ and BAT-)": "Hold current limit: 3.7 A @ 20°C | Input: External battery, 7 Ah lead-acid, typi",
        "Internal Lithium Battery": "Battery: 3 V coin cell CR2032X for battery-backed clock | Life: 6 years with no ",
        "Real-Time Clock Accuracy": "±3 min. per year",
        "CPU Drive/Programs": "50 MB serial flash",
        "Data Storage": "50 MB serial flash"
      },
      "COMMUNICATIONS": {
        "Internet Protocols": "Ethernet | PPP | RNDIS | ICMP/Ping | Auto-IP (APIPA) | IPv4 | IPv6 | UDP | TCP |",
        "Communications Protocols": "PakBus | PakBus Encryption | Modbus RTU/ASCII/TCP | DNP3 | SDI-12 | and others"
      },
      "PHYSICAL": {
        "Dimensions": "16.3 x 8.4 x 5.6 cm (6.4 x 3.3 x 2.2 in.) | Additional clearance required for ca",
        "Weight": "288 to 306 g (0.64 to 0.68 lb) depending on communications option selected",
        "Warranty": "3 years"
      }
    }
  },
  {
    "id": "CSI_TEMP120_XD",
    "model": "TEMP120-XD",
    "name": "TEMP 120",
    "category": "Measurement Devices",
    "subcategory": "Thermocouple Measurement Modules",
    "deviceType": "Measurement Device",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/12081",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "TEMP120-XD",
        "Category": "Measurement Devices",
        "Subcategory": "Thermocouple Measurement Modules",
        "Device Type": "Measurement Device"
      },
      "Measurements": {
        "Supported": "Temperature"
      },
      "General Specifications": {
        "Product Variant": "Extended Duty (XD)",
        "Product Type": "20-Channel Thermocouple Module",
        "Number of Channels": "20",
        "Terminal Type": "Universal (copper/copper), miniature socket connectors",
        "Supported Thermocouple Types": "B, E, J, K, N, R, S, T",
        "A/D Converter": "24-bit sigma-delta"
      }
    }
  },
  {
    "id": "CSI_VWIRE305_XD",
    "model": "VWIRE305-XD",
    "name": "VWIRE 305",
    "category": "Measurement Devices",
    "subcategory": "Vibrating Wire Measurement Modules",
    "deviceType": "Measurement Device",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/12090",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "VWIRE305-XD",
        "Category": "Measurement Devices",
        "Subcategory": "Vibrating Wire Measurement Modules",
        "Device Type": "Measurement Device"
      },
      "Measurements": {
        "Supported": "Temperature"
      },
      "General Specifications": {
        "Product Type": "8-Channel Dynamic Vibrating-Wire Analyzer",
        "Number of Input Channels": "8",
        "Sensor Capacity per Channel": "1 vibrating wire sensor",
        "Temperature Sensor per Channel": "1 embedded thermistor or RTD",
        "Channel Measurement Mode": "All channels measured simultaneously",
        "Measurement Technology": "VSPECT™ dynamic vibrating-wire measurement technology"
      }
    }
  },
  {
    "id": "CSI_CELL205_AT",
    "model": "CELL205-AT",
    "name": "4G LTE Cat1 Cellular Module for North America (-4",
    "category": "Communications",
    "subcategory": "Cellular Communications",
    "deviceType": "Cellular Modem / Router",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/11178",
    "productUrl": "https://www.campbellsci.com/products/cell205",
    "specs": {
      "General": {
        "Model": "CELL205-AT",
        "Category": "Communications",
        "Subcategory": "Cellular Communications",
        "Device Type": "Cellular Modem / Router",
        "Product Series": "CELL200 Series",
        "Product Model": "CELL205"
      }
    }
  },
  {
    "id": "CSI_RV50X",
    "model": "RV50X",
    "name": "RV50X",
    "category": "Communications",
    "subcategory": "Cellular Communications",
    "deviceType": "Cellular Modem / Router",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/7892",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "RV50X",
        "Category": "Communications",
        "Subcategory": "Cellular Communications",
        "Device Type": "Cellular Modem / Router"
      },
      "General Specifications": {
        "Product Type": "Industrial 4G LTE Cellular Gateway",
        "Device Classification": "Primary communications device / cellular gateway",
        "Available Configurations": "RV50X-NE-V – Provisioned for Verizon US; RV50X-NE-VS – Provisioned for Verizon U",
        "Network Technology": "4G LTE with automatic fallback to 3G",
        "Cellular Technologies": "4G LTE; 3G HSPA/HSPA+; 3G TD-SCDMA (Asia Pacific model only)",
        "Radio Module": "MC7455"
      }
    }
  },
  {
    "id": "CSI_RF407",
    "model": "RF407",
    "name": "RF407",
    "category": "Communications",
    "subcategory": "Spread-Spectrum Radios",
    "deviceType": "Radio Communication Device",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/7539",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "RF407",
        "Category": "Communications",
        "Subcategory": "Spread-Spectrum Radios",
        "Device Type": "Radio Communication Device"
      },
      "General Specifications": {
        "Product Type": "900 MHz Spread-Spectrum Radio",
        "Device Classification": "Primary communications device / spread-spectrum radio",
        "Product Family": "RF407-series",
        "Country / Region": "US, Canada",
        "Radio Type": "Frequency Hopping Spread Spectrum (FHSS)",
        "Operating Frequency": "902 to 928 MHz"
      }
    }
  },
  {
    "id": "CSI_NL241",
    "model": "NL241",
    "name": "NL241",
    "category": "Communications",
    "subcategory": "Wi-Fi Communications",
    "deviceType": "Wi-Fi Communication Device",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/9653",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "NL241",
        "Category": "Communications",
        "Subcategory": "Wi-Fi Communications",
        "Device Type": "Wi-Fi Communication Device"
      },
      "General Specifications": {
        "Product Type": "Wireless Network Link Interface",
        "Device Classification": "Primary communications device / Wi-Fi WLAN interface",
        "Primary Application": "Provides Wi-Fi connectivity for Campbell Scientific data loggers and peripherals",
        "Network Operation": "Can join an existing Wi-Fi network or create a Wi-Fi access point",
        "Supported Connection Modes": "PakBus router; TCP Serial Server; TCP Serial Client; Modbus TCP/IP Gateway; Wi-F",
        "Transmission Area": "Worldwide"
      }
    }
  },
  {
    "id": "CSI_NL201_ST",
    "model": "NL201-ST",
    "name": "NL201-ST",
    "category": "Communications",
    "subcategory": "Ethernet Communications",
    "deviceType": "Ethernet Communication Device",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4349",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "NL201-ST",
        "Category": "Communications",
        "Subcategory": "Ethernet Communications",
        "Device Type": "Ethernet Communication Device"
      },
      "General Specifications": {
        "Base Model": "NL201",
        "Product Type": "Network Link Interface / Serial-to-Ethernet Interface",
        "Device Classification": "Primary communications device / Ethernet network interface",
        "Temperature Configuration": "Standard temperature",
        "Temperature Range": "-25 to +50 °C",
        "Primary Application": "Provides wired Ethernet connectivity to data loggers, peripherals, and other ser"
      }
    }
  },
  {
    "id": "CSI_TX325",
    "model": "TX325",
    "name": "Satellite Transmitter for GOES V2 (-40 to +60C)**",
    "category": "Communications",
    "subcategory": "Satellite Communications",
    "deviceType": "Satellite Communication Device",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/12207",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "TX325",
        "Category": "Communications",
        "Subcategory": "Satellite Communications",
        "Device Type": "Satellite Communication Device"
      },
      "General Specifications": {
        "Product Type": "Satellite Transmitter for GOES CS2/v2.0",
        "Satellite System": "GOES DCS",
        "Successor To": "TX321",
        "Communication Direction": "One-way satellite data transmission",
        "Transmissions Supported": "Random; Timed (Scheduled)",
        "Supported Transmission Rates": "300 and 1200 bps"
      }
    }
  },
  {
    "id": "CSI_CH200",
    "model": "CH200",
    "name": "12V Charging Regulator (-40 to +60C)",
    "category": "Power",
    "subcategory": "Charge Regulators and DC Adapters",
    "deviceType": "Charge Regulator / DC Adapter",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/3806",
    "productUrl": "https://www.campbellsci.com/products/ch200",
    "specs": {
      "General": {
        "Model": "CH200",
        "Category": "Power",
        "Subcategory": "Charge Regulators and DC Adapters",
        "Device Type": "Charge Regulator / DC Adapter"
      },
      "GENERAL": {
        "Operational Temperature": "-40°C to +60°C; VRLA battery manufacturers state that “heat kills batteries” and",
        "Dimensions": "7.5 × 3.7 × 10.0 cm (3 × 1.5 × 3.9 in.)"
      },
      "CHARGE – CHARGE TERMINALS (AC OR DC SOURCE)": {
        "AC": "18 to 24 VRMS, internally limited to 1.2 ARMS maximum",
        "DC": "16 to 40 Vdc, internally limited to 1.1 Adc maximum"
      },
      "SOLAR TERMINALS (SOLAR PANEL OR OTHER DC SOURCE)": {
        "Note": "Battery voltages below 8.7 V may result in less than 3.0 A current limit because",
        "Input Voltage Range": "15 to 40 Vdc",
        "Maximum Charging Current": "4.0 Adc typical (3.2 to 4.9 Adc depending upon individual charger)"
      },
      "QUIESCENT CURRENT": {
        "No Charge Source Present": "300 µA maximum",
        "No Battery Connected": "2 mA maximum"
      },
      "BATTERY CHARGING": {
        "Battery Charging Note": "Two-step temperature-compensated constant-voltage charging for valve-regulated l",
        "CYCLE Charging": "Vbatt(T) = 14.70 V − (24 mV) × (T − 25°C)",
        "FLOAT Charging": "Vbatt(T) = 13.65 V − (18 mV) × (T − 25°C)",
        "Charging Voltage Accuracy": "±1% on charging voltage over -40°C to +60°C"
      },
      "POWER OUT (+12 TERMINALS)": {
        "Voltage": "Unregulated 12 V from battery",
        "Output Protection": "4 A self-resettable thermal fuse",
        "Fuse Hold Current Limit": ">4 A (<20°C); 2.7 A (60°C); 3.1 A (50°C); 4.0 A (20°C)"
      },
      "MEASUREMENTS": {
        "Measurement Temperature Note": "At -40°C to +60°C",
        "Average Battery Voltage": "±(1% of reading + 15 mV)",
        "Average Battery/Load Current": "±(2% of reading + 2 mA)"
      },
      "REGULATOR INPUT VOLTAGE": {
        "Solar": "±(1% of reading − 0.25 V) / −(1% of reading + 1 V)",
        "Solar Negative Offset Note": "1.0 V negative offset is worst-case due to reversal protection diode on input; t",
        "Continuous": "±(1% of reading − 0.5 V) / −(1% of reading + 2 V)",
        "Continuous Negative Offset Note": "2.0 V negative offset is worst-case due to two series diodes in AC full-bridge; ",
        "Charger Temperature": "±2°C"
      }
    }
  },
  {
    "id": "CSI_PS150",
    "model": "PS150",
    "name": "12 V Power Supply with Charging Regulator and 7 Ah Sealed Rechargeable Battery",
    "category": "Power",
    "subcategory": "Power Supplies and Charge Regulators",
    "deviceType": "Power Supply / Charge Regulator",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/5178",
    "productUrl": "https://www.campbellsci.com/products/ps150",
    "specs": {
      "General": {
        "Model": "PS150",
        "Category": "Power",
        "Subcategory": "Power Supplies and Charge Regulators",
        "Device Type": "Power Supply / Charge Regulator"
      },
      "General Specifications": {
        "Operational Temperature": "-40°C to +60°C; VRLA battery manufacturers state that “heat kills batteries” and",
        "Dimensions": "19.3 × 7.6 × 10.6 cm (7.5 × 3 × 4.2 in.)"
      },
      "CHARGE - CHARGE TERMINALS (AC OR DC SOURCE)": {
        "AC": "18 to 24 VRMS, internally limited to 1.2 ARMS",
        "DC": "16 to 40 Vdc, internally limited to 0.85 Adc"
      },
      "SOLAR TERMINALS (SOLAR PANEL OR OTHER DC SOURCE)": {
        "Note": "Battery voltages below 8.7 V may result in <3.0 A current limit because of fold-",
        "Input Voltage Range": "15 to 40 Vdc",
        "Maximum Charging Current": "4.0 Adc typical; 3.2 to 4.9 Adc depending upon individual charger"
      },
      "QUIESCENT CURRENT": {
        "No Charge Source Present": "160 µA at 13.7 Vdc",
        "No Battery Connected": "930 µA at 30 V input voltage, AC or DC"
      },
      "BATTERY CHARGING": {
        "Note": "“T” represents temperature in degrees Celsius",
        "FLOAT Charging": "Vbatt(T) = 13.65 V - (24 mV) × (T - 25) + (0.24 mV) × (T - 25)²",
        "Accuracy": "±1% on charging voltage over -40°C to +60°C"
      },
      "POWER OUT (+12 TERMINALS)": {
        "Voltage": "Unregulated 12 V from battery; 4.65 A solid-state circuit breaker",
        "Standards": "ETL Listed Class 2 power supply"
      }
    }
  },
  {
    "id": "CSI_PS200",
    "model": "PS200",
    "name": "Smart 12 V Power Supply with Charging Regulator and 7 Ah Rechargeable Battery",
    "category": "Power",
    "subcategory": "Power Supplies and Charge Regulators",
    "deviceType": "Power Supply / Charge Regulator",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/3815",
    "productUrl": "https://www.campbellsci.com/products/ps200",
    "specs": {
      "General": {
        "Model": "PS200",
        "Category": "Power",
        "Subcategory": "Power Supplies and Charge Regulators",
        "Device Type": "Power Supply / Charge Regulator"
      },
      "GENERAL": {
        "Operational Temperature": "-40°C to +60°C; VRLA battery manufacturers state that “heat kills batteries” and",
        "Weight": "376.48 g (0.83 lb)"
      },
      "CHARGE – CHARGE TERMINALS (AC OR DC SOURCE)": {
        "AC": "18 to 24 VRMS, with 1.2 ARMS maximum",
        "DC": "16 to 40 Vdc, with 1.1 A DC maximum"
      },
      "SOLAR TERMINALS (SOLAR PANEL OR OTHER DC SOURCE)": {
        "Note": "Battery voltages below 8.7 V may result in less than 3.0 A current limit because",
        "Input Voltage Range": "15 to 40 Vdc",
        "Maximum Charging Current": "4.0 Adc typical (3.2 to 4.9 Adc depending upon individual charger)"
      },
      "QUIESCENT CURRENT": {
        "No Charge Source Present": "300 µA maximum",
        "No Battery Connected": "2 mA maximum"
      },
      "BATTERY CHARGING": {
        "Battery Charging Note": "Two-step temperature-compensated constant-voltage charging for valve-regulated l",
        "CYCLE Charging": "Vbatt(T) = 14.70 V − (24 mV) × (T − 25°C)",
        "FLOAT Charging": "Vbatt(T) = 13.65 V − (18 mV) × (T − 25°C)",
        "Charging Voltage Accuracy": "±1% on charging voltage over -40°C to +60°C"
      },
      "POWER OUT (+12 TERMINALS)": {
        "Voltage": "Unregulated 12 V from battery",
        "Output Protection": "4 A self-resettable thermal fuse",
        "Fuse Hold Current Limit": ">4 A (<20°C); 2.7 A (60°C); 3.1 A (50°C); 4.0 A (20°C)"
      },
      "MEASUREMENTS": {
        "Measurement Temperature Note": "Over -40°C to +60°C range",
        "Average Battery Voltage": "±(1% of reading + 15 mV)",
        "Average Battery/Load Current": "±(2% of reading + 2 mA)"
      },
      "REGULATOR INPUT VOLTAGE": {
        "Solar": "±(1% of reading − 0.25 V) / −(1% of reading + 1 V)",
        "Solar Negative Offset Note": "1.0 V negative offset is worst-case due to reversal protection diode on input; t",
        "Continuous": "±(1% of reading − 0.5 V) / −(1% of reading + 2 V)",
        "Continuous Negative Offset Note": "2.0 V negative offset is worst-case due to two series diodes in AC full-bridge; ",
        "Charger Temperature": "±2°C"
      }
    }
  },
  {
    "id": "CSI_PS84_CR",
    "model": "PS84-CR",
    "name": "PS84 84 Ah Power Supply with CH200 Regulator and 14 x 16 in. Enclosure",
    "category": "Power",
    "subcategory": "Power Supplies and Charge Regulators",
    "deviceType": "Power Supply / Charge Regulator",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/1449",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "PS84-CR",
        "Category": "Power",
        "Subcategory": "Power Supplies and Charge Regulators",
        "Device Type": "Power Supply / Charge Regulator"
      },
      "General Specifications": {
        "Product Type": "84 Ah Power Supply with 14 × 16 in. Enclosure",
        "Device Classification": "Primary power-supply assembly",
        "Configuration / Regulator": "CH200 Regulator",
        "Primary Application": "Power supply for systems with larger power requirements, housed in a separate en",
        "Included Main Components": "84 Ah battery; mounting bracket; 14 × 16 in. environmental enclosure; CH200 Regu",
        "Charging Source": "Typically an unregulated solar panel through CH200 Regulator"
      }
    }
  },
  {
    "id": "CSI_SUNSCOUT",
    "model": "SunScout",
    "name": "Class A Solar Resource Assessment Station",
    "category": "Systems",
    "subcategory": "Solar Monitoring Stations",
    "deviceType": "Solar Monitoring Station",
    "protocol": "SDI-12",
    "image": "https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/15536",
    "productUrl": null,
    "specs": {
      "General": {
        "Model": "SunScout",
        "Category": "Systems",
        "Subcategory": "Solar Monitoring Stations",
        "Device Type": "Solar Monitoring Station"
      },
      "General Specifications": {
        "Product Type": "Solar Resource Assessment Station",
        "System Class / Positioning": "Class A Solar Resource Assessment",
        "Primary Application": "Solar resource assessment and solar project monitoring",
        "Data Acquisition": "Campbell Scientific CR350 datalogger with embedded cellular gateway",
        "Programming Standard": "Programmed according to industry best practices and IEC 61724-1",
        "Maintenance Logging": "Easy-access maintenance button to record maintenance tasks"
      }
    }
  }
];
