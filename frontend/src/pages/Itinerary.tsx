import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

enum Tab {
    MyItineraries = 'Mis itinerarios',
    CreateEdit = 'Crear/Editar',
    Transport = 'Transporte',
}

type Props = {}

const Itinerary = (props: Props) => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.MyItineraries);
    const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);

    const renderTabContent = () => {
        switch (activeTab) {
            case Tab.MyItineraries:
                return <div>My Itineraries Content</div>;
            case Tab.CreateEdit:
                return <div>Create/Edit Itinerary Content</div>;
            case Tab.Transport:
                return <div>Transport Content</div>;
            default:
                return null;
        }
    }

    return (
        <>
            <Header />
            <div className="itinerary-page">
                <h1>Gestión de itinerarios</h1>

                <div className="tab-bar">
                    {Object.values(Tab).map(tab => (
                        <button
                            key={tab}
                            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Itinerary