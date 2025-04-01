import React from 'react'
import { ListItem } from '../types/ListItem'
import '../styles/ListItems.css'

interface ListItemsProps<T extends ListItem> {
    items: T[];
    onItemClick?: (item: T) => void;
    emptyMessage?: string;
    title?: string;
    className?: string;
}

const ListItems = <T extends ListItem>({
    items,
    onItemClick,
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

                                {'location' in item && (
                                    <p className="item-location">
                                        <small>Coordenadas: {item.location.lat.toFixed(4)}, {item.location.lng.toFixed(4)}</small>
                                    </p>
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