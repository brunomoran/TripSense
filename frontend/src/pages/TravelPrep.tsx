import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import Map from '../components/Map';
import POIList from '../components/POIList';

import "../styles/TravelPrep.css";

type Props = {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const TravelPrep = (props: Props) => {
  return (
    <>
      <Header />
      <div className="travel-prep-container">
        <div className='search-section'>
          <SearchBar placeholder="Barcelona" onChange={() => console.log("Content changed")} />
          <p className='location-text'>O prueba a</p>
          <button className='location-button'>Usar tu ubicación actual</button>
        </div>

        <div className="content-section">
          <div className="left-column">
            <FilterDropdown />
            <POIList />
          </div>
          <Map />
        </div>
      </div>
      <Footer />
    </>
  )
}

export default TravelPrep

