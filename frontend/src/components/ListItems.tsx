import React from 'react'
import { ListItem } from '../types/ListItem'
import '../styles/ListItems.css'

interface ListItemsProps<T extends ListItem> {
    items: T[];
    onItemClick?: (item: T) => void;
    onAddItinerary?: (item: T) => void;
    emptyMessage?: string;
    title?: string;
    className?: string;
}

const ListItems = <T extends ListItem>({
    items,
    onItemClick,
    onAddItinerary,
    emptyMessage = "No hay elementos para mostrar",
    title,
    className = ""
}: ListItemsProps<T>) => {

    return (
        <section className={`list-section-${className}`}>
            {title && <h2 className="list-title">{title}</h2>}

            {items.length === 0 ? (
                <p className='empty-message'>{emptyMessage}</p>
            ) : (
                <div className="items-list">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="item-card"
                            onClick={() => onItemClick && onItemClick(item)}
                        >
                            {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="item-image" />
                            )}
                            <div className="item-content">
                                <h3 className="item-name">{item.name}</h3>
                                <p className="item-description">{item.description}</p>
                                {item.category && <p className="item-category">{item.category}</p>}

                                {onAddItinerary && (
                                    <button
                                        className="add-itinerary-button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evita que el evento de clic se propague al contenedor padre
                                            onAddItinerary(item);
                                        }}
                                    >
                                        ➕ Añadir al itinerario
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default ListItems;