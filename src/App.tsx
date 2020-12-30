import React, { useEffect, useState } from 'react';
import './App.css';
import Chart from 'react-apexcharts'
import axios from 'axios';

import Grid from '@material-ui/core/Grid';
import { format } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

const App: React.FC = () => {

  const [lastDate, setLastDate] = useState<number>(30);
  const [dataCovid19, setDataCovid19] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);
  const [minDate, setMinDate] = useState<Date>(new Date(new Date().getTime() - lastDate * 86400000));
  const [maxDate, setMaxDate] = useState<Date>(new Date(new Date().getTime() - 1 * 86400000));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const options = {
    chart: {
      id: 'apexchart-example'
    },
    plotOptions: {
      bar: {
        horizontal: true,
      }
    },
    xaxis: {
      categories: categories
    }
  }
  const series = [{
    name: 'cases',
    data: data
  }]

  useEffect(() => {
    CallAPISortByCases()
  }, [])

  useEffect(() => {
    CallAPIHistorical()
  }, [categories])

  useEffect(() => {
    let cases = dataCovid19.map(m => m.timeline.cases)
    let date = [selectedDate?.getMonth() as number + 1, selectedDate?.getDate(), selectedDate?.getFullYear().toString().substring(2,4)].join('/')
    let listCases = cases.map(f => Object.entries(f).filter(item => item[0] === date).map((key, val) => key[1])[0] as number)
    setData(listCases)
  }, [selectedDate])

  const CallAPISortByCases = async () => {
    try {
      const response = await axios.get('https://disease.sh/v3/covid-19/countries?sort=cases');
      setCategories(response.data.slice(0, 20).map((m: any) => m.country))
    } catch (error) {
      console.error(error);
    }
  }

  const CallAPIHistorical = async () => {
    try {
      if (categories.length > 0) {
        const response = await axios.get('https://disease.sh/v3/covid-19/historical/' + categories.join(',') + '?lastdays=' + lastDate);
        setDataCovid19(response.data)
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="App">
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Grid container justify="space-around">
          <KeyboardDatePicker
            margin="normal"
            id="date-picker-dialog"
            label="Date picker dialog"
            format="dd/MM/yyyy"
            minDate={minDate}
            maxDate={maxDate}
            value={selectedDate}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          />
        </Grid>
      </MuiPickersUtilsProvider>
      < Chart options={options} series={series} type="bar" width={800} height={600} />
    </div>
  );
}

export default App;
