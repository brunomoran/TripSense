import React from 'react'
import { useState } from 'react'

import "../styles/FilterDropdown.css"


const FilterDropdown = () => {

    const options = [
        'Más popular',
        'Más cercano',
        'Más barato'
    ]
    const [selectedOption, setSelectedOption] = useState(options[0])
    const [isOpen, setIsOpen] = useState(false)

    const handleOptionClick = (option: string) => {
        setSelectedOption(option)
        setIsOpen(false)
    }

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleOutsideClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement
        if (isOpen && !target.closest('.dropdown')) {
            setIsOpen(false)
        }
    }

    React.useEffect(() => {
        document.addEventListener('click', handleOutsideClick)
        return () => {
            document.removeEventListener('click', handleOutsideClick)
        }
    }, [isOpen])

    return (
        <div className='filters-dropdown'>
            <button className='dropdown-button' onClick={toggleDropdown}>
                {selectedOption} <span className='arrow'>{isOpen ? '▲' : '▼'}</span>
            </button>
            {isOpen && (
                <ul className='dropdown-menu'>
                    {options.map((option, index) => (
                        <li key={index} className={option === selectedOption ? 'active' : ''} onClick={() => handleOptionClick(option)}>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default FilterDropdown