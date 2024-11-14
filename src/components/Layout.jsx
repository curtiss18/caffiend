import { useState } from "react"
import Authentication from "./Authentication"
import Modal from "./Modal"
import { useAuth } from "../context/AuthContext"

export default function Layout(props) {
    const { children } = props

    const [showModal, setShowModal] = useState(false)
    const [missingData, setMissingData] = useState(null)

    const { globalUser, logout } = useAuth()
    
    const header = (
        <header>
            <div>
                <h1 className="text-gradient">CAFFIEND</h1>
                <p>For Coffee Insatiates</p>
            </div>
            {globalUser ? (
                <button onClick={() => { logout()}}>
                    <p>Logout</p>
                </button>
            ) : (
                <button onClick={() => { setShowModal(true) }}>
                    <p>Sign up free</p>
                    <i className="fa-solid fa-mug-hot"></i>
                </button>
            )}
        </header>
    )

    const footer = (
        <footer>
            <p><span className="text-gradient">Caffiend</span> was made by <a href="https://www.smoljames.com" target="_blank">Smoljames</a><br />
            using the <a href="https://www.fantacss.xmoljames.com" target="_blank">FantaCSS</a> design library<br />
            Check out the project on <a href="https://github.com/curtiss18/UltimateWebPortfolio" target="_blank">GitHub</a></p>
        </footer>
    )

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
            {header}
            <main>
                {children}
            </main>
            {footer}
        </>
    )
}