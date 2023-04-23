import React, { useState, useEffect } from 'react';
import '../../styles/DisplayTourResults.css';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import { Button, Tooltip } from '@mui/material';


// import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import WineBarIcon from '@mui/icons-material/WineBar';




import Stack from '@mui/material/Stack';



import { Box } from '@mui/material'

function DisplayTourResults() {
  const [queryResults, setQueryResults] = useState([]);
  const [tableIndex, setTableIndex] = useState(0);
  const storedData = JSON.parse(localStorage.getItem('formData'));
  const tourCount = storedData.TourCount;
  const [logoUrls, setLogoUrls] = useState({});

  

  const supportedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg'];

useEffect(() => {
  fetch('/api/getUserdata')
    .then((res) => res.json())
    .then(async (data) => {
      const sortedTables = sortTablesByAverageScore(data, tourCount);
      setQueryResults(sortedTables);

      const urls = await Promise.all(
        sortedTables.flatMap((table) =>
          table.wineries.map(async (winery) => {
            const id = winery.winery_ID;
            let logoUrl = '';

            for (const ext of supportedExtensions) {
              try {
                const logo = await import(`../../assets/winery-logo/winery-${id}.${ext}`);
                logoUrl = logo.default;
                break;
              } catch (error) {
                console.debug(`No logo found for winery-${id} with extension .${ext}`);
              }
            }

            if (!logoUrl) {
              console.error(`Error loading logo for winery-${id}`);
            }

            return { id, url: logoUrl }; // Return the found logo URL or an empty string if no logo was found
          })
        )
      );

      setLogoUrls(Object.fromEntries(urls.map(({ id, url }) => [id, url])));
    })
    .catch((err) => {
      console.error(err);
    });
}, [tourCount]);


  function calculateAverage(wineries, tourCount) {
    const totalScore = wineries.slice(0, tourCount).reduce((sum, winery) => sum + winery.weightedScore, 0);
    return totalScore / tourCount;
  }

  function sortTablesByAverageScore(tables, tourCount) {
    return tables.slice().sort((a, b) => {
      const averageA = calculateAverage(a.wineries, tourCount);
      const averageB = calculateAverage(b.wineries, tourCount);
      return averageB - averageA;
    });
  }

  function handleNext() {
    setTableIndex((prevIndex) => (prevIndex + 1) % queryResults.length);
  }

  function handlePrevious() {
    setTableIndex((prevIndex) => (prevIndex - 1 + queryResults.length) % queryResults.length);
  }

  const currentTable = queryResults[tableIndex];

  return (
    <div style={{ textAlign: 'center' }} dir="rtl">
        <br/><br/><br/><br/><br/>
      <h2 style={{ textAlign: 'center' }}>רשימת יקבים:</h2>
      {queryResults.length > 0 && currentTable ? (
        <>
          <h3>{currentTable.area}</h3>
          <p>
            ממוצע ניקוד:{" "}
            {calculateAverage(currentTable.wineries, tourCount).toFixed(2)}
          </p>
          <div className="card-container">
            {currentTable.wineries.slice(0, tourCount).map((result, index) => (
              <div className="card" key={index}>
                <a href={result.website} target="_blank" rel="noopener noreferrer">
                  <img
                    className="card-img"
                    src={logoUrls[result.winery_ID]}
                    alt={result.winery_name}
                  />
                </a>
                <div className="card-content">
                  <h4>{result.winery_name} {result.winery_ID}</h4>
                  <p>{result.secondary_area}</p>
                  <p>{result.address}</p>
                  <p>{result.weightedScore ? result.weightedScore.toFixed(2) : 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
          <br/>
          {/* <button onClick={handlePrevious}>הקודם</button> */}
          {/* <button onClick={handleNext}>סיור אחר</button> */}

          <link rel="preconnect" href="https://fonts.googleapis.com"></link>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin></link>
          <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@900&display=swap" rel="stylesheet"></link>

          <Stack spacing={2} direction='row' sx={{justifyContent: 'center'}}>
          <Tooltip title="מצא סיור אחר">
            <Button 
              onClick={handleNext}
              variant="contained" 
              sx={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'rgba(203, 67, 53)',
                  '&:hover': { backgroundColor: 'rgba(231, 76, 60)' },
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: '5px' // add margin to the left of the button
              }}
          >
              <TravelExploreIcon sx={{ fontSize: '45px', marginLeft: '0px' }} />
          </Button>
          </Tooltip>
        </Stack>
        <br/>
        <br/>



        </>
      ) : (
        <p dir="rtl" style={{ textAlign: 'center' }}>
          {queryResults.length === 0 ? 'לא נמצאו תוצאות במערכת' : 'טוען...'}
        </p>
      )}
    </div>
  );
}

export default DisplayTourResults;
