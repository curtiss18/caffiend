import { coffeeOptions } from "../utils"
import { useState } from "react"
import Authentication from "./Authentication"
import Modal from "./Modal"
import { useAuth } from "../context/AuthContext"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../../firebase"

export default function CoffeeForm(props) {
    const { isAuthenticated } = props
    const [showModal, setShowModal] = useState(false)
    const [selectedCoffee, setSelectedCoffee] = useState(null)
    const [showCoffeeTypes, setShowCoffeeTypes] = useState(false)
    const [coffeeCost, setCoffeeCost] = useState('')
    const [hour, setHour] = useState(0)
    const [min, setMin] = useState(0)
    const [missingData, setMissingData] = useState(null)

    const { globalData, setGlobalData, globalUser } = useAuth()

    async function handleSubmitForm() {
        // define a guard clase that only submits the form if data is completed
        if (!selectedCoffee || coffeeCost === '') {
            setMissingData('Make sure to select a coffee and enter the price')
            return
        }

        if (!isAuthenticated) {
            setShowModal(true)
            return
        }
        
        setMissingData(null)

        try {
            // then we're going to create a new data object
            const newGlobalData = {
                ...(globalData || {}) 
            }

            const nowTime = Date.now()
            const timeToSubtract = (hour * 60 * 60 * 1000) + (min * 60 * 60)
            const timestamp = nowTime - timeToSubtract

            const newData = {
                name: selectedCoffee,
                cost: coffeeCost  
            }
            newGlobalData[timestamp] = newData
            console.log(timestamp, selectedCoffee, coffeeCost)

            // update the global state
            setGlobalData(newGlobalData)

            //persist the data in the firebase firestore
            const userRef = doc(db, 'users', globalUser.uid)
            const res = await setDoc(userRef, {
                [timestamp]: newData
            },  {merge: true})

            setSelectedCoffee(null)
            setHour(0)
            setMin(0)
            setCoffeeCost('')
        } catch (err) {
            console.log(err.message)
        }
    }

    function handleCloseModal() {
        setShowModal(false)
    }

    return (
        <>
            {showModal && (
                <Modal handleCloseModal={handleCloseModal}>
                    <Authentication handleCloseModal = {handleCloseModal} />
                </Modal>
            )}
            <div className="section-header">
                <i className="fa-solid fa-pencil" />
                <h2>Start Tracking Today</h2>
            </div>
            <h4>Select coffee type</h4>
            <div className="coffee-grid">
                {coffeeOptions.slice(0, 5).map((option, optionIndex) => [
                    <button className={"button-card"  + (option.name === selectedCoffee ? ' coffee-button-selected' : '')} key={optionIndex} onClick={() => {
                        setSelectedCoffee(option.name)
                        setShowCoffeeTypes(false)
                        setMissingData(false)
                    }}>
                        <h4>{option.name}</h4>
                        <p>{option.caffeine}mg</p>
                    </button>
                ])}
                <button className={"button-card"  + (showCoffeeTypes ? ' coffee-button-selected' : '')} onClick={() => {
                    setShowCoffeeTypes(true)
                    setSelectedCoffee(null)
                }}>
                    <h4>Other</h4>
                    <p>n/a</p>
                </button>
            </div>
            {showCoffeeTypes && (
                <select onChange={(e) => {setSelectedCoffee(e.target.value), setMissingData(false)}}
                    id="coffee-list" 
                    name="coffee-list">
                        <option value={null}>Select type</option>
                        {coffeeOptions.map((option, optionIndex) => {
                            return (
                                <option value={option.name} key={optionIndex}>
                                    {option.name} ({option.caffeine}mg)
                                </option>
                            )
                        })}
                </select>
            )}
            <h4>Add the cost ($)</h4>
            <input className="w-full" 
                type="number" 
                value={coffeeCost}
                placeholder="4.50" 
                onChange={(e)=>{setCoffeeCost(e.target.value), setMissingData(false)}} 
            />
            <h4>Time since consumption</h4>
            <div className="time-entry">
                <div>
                    <h6>Hours</h6>
                    <select id="hours-select" 
                        onChange={(e) => {setHour(e.target.value)}}
                    >
                        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map((hour, hourIndex) => {
                            return (
                                <option key={hourIndex} value={hour}>{hour}</option>
                            )
                        })}
                    </select>
                </div>
                <div>
                    <h6>Mins</h6>
                    <select id="minute-select" 
                        onChange={(e) => {setMin(e.target.value)}}
                    >
                        {[0,5,10,15,30,45].map((min, minIndex) => {
                            return (
                                <option key={minIndex} value={min}>{min}</option>
                            )
                        })}
                    </select>
                </div>
            </div>
            <div className="error-message">
                <p>{missingData}</p>
            </div>
            <button onClick={() => {handleSubmitForm()}}><p>Add Entry</p></button>
        </>
    )
}