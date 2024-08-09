// src/utils/loadData.js
import Papa from 'papaparse';

export const loadData = async () => {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7bTpBukTxITHJxqZx4o038wl2Lm4HwFT3G-skWdvLjhNN3u-nlPJPmTE-rJWG7AY2_wgXdny0zcvA/pub?output=csv';

  const response = await fetch(url);
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};