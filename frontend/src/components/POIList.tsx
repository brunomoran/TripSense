import React from 'react'

type Props = {}

type POI = {
    id: number;
    name: string;
    description: string;
    location: {
        lat: number;
        lng: number;
    };
    category: string;
    imageUrl: string;
}

const POIList = (props: Props) => {
    
    // Datos de ejemplo
    const poiList: POI[] = [
        {
            id: 1,
            name: "Sagrada Familia",
            description: "A large unfinished Roman Catholic basilica in Barcelona.",
            location: {
                lat: 41.4036,
                lng: 2.1744
            },
            category: "Landmark",
            imageUrl: "https://example.com/sagrada_familia.jpg"
        },
        {
            id: 2,
            name: "Park Güell",
            description: "A public park designed by Antoni Gaudí.",
            location: {
                lat: 41.4145,
                lng: 2.1527
            },
            category: "Park",
            imageUrl: "https://example.com/park_guell.jpg"
        }
    ]
    
    return (
        <section className='poi-section'>
            <div className='poi-list'>
                {poiList.map((poi) => (
                    <div key={poi.id} className='poi-card'>
                        <img src={poi.imageUrl} alt={poi.name} className='poi-image' />
                        <h3 className='poi-name'>{poi.name}</h3>
                        <p className='poi-description'>{poi.description}</p>
                        <span className='poi-category'>{poi.category}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default POIList