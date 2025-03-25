import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';

type Props = {
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const TravelPrep = (props: Props) => {
  return (
    <>
      <Header />
      <SearchBar placeholder="Barcelona" onChange={() => console.log("Content changed")}/>
      <div>TravelPrep</div>
      <Footer />
    </>
  )
}

export default TravelPrep

