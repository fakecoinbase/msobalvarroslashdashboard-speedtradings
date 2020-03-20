import React, { useState, useEffect } from "react"
import { Link, Redirect } from "react-router-dom"
import Axios from "axios"
import Validator from "validator"

// Import styles
import "./Register.scss"

// import Assets
import Logo from "../../static/images/logo.png"

// Import Components
import Countries from "../../utils/countries.json"
import ModalTerms from "../../components/Modal/ModalTerms"
import ActivityIndicator from "../../components/ActivityIndicator/Activityindicator"

import { urlServer, Toast } from "../../utils/constanst"

const Register = (props) => {
    // Params from url
    const { match } = props

    const [redirect, setRedirect] = useState(false)

    // Show render loader
    const [loader, setLoader] = useState(true)

    // Valida si el usuario ya existe
    const [validateUser, setValidateUser] = useState(null)

    // Valida si el usuario sponsor existe
    const [validateUserSponsor, setValidateUserSponsor] = useState(null)

    // State for show tabs view
    const [tabActive, setTab] = useState(4)

    // Show modal terms
    const [modal, setModal] = useState(false)

    // Input accept terms check
    const [term, setTerms] = useState(false)

    // form control data
    const [firstName, setFirstname] = useState('')
    const [lastname, setLastname] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [country, setCountry] = useState('0')
    const [hash, setHash] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [passwordSecurity, setPasswordSecurity] = useState('')
    const [walletBTC, setWalletBTC] = useState('')
    const [walletETH, setWalletETH] = useState('')
    const [investmentPlan, setInvestmentPlan] = useState(null)
    const [usernameSponsor, setUsernameSponsor] = useState('')
    // Crypto select
    const [crypto, setCrypto] = useState('1')

    // Plan selection
    const [plan, setPlan] = useState([])

    const validationButtons = {
        first: firstName.length > 0 && lastname.length > 0 && Validator.isEmail(email) && phone.length > 6 && country !== '0',
        second: hash.length > 10 && walletBTC.length > 10 && walletETH.length > 10,
        third: investmentPlan !== null,
        fourth: password === passwordSecurity && password.length > 0 && passwordSecurity.length > 0 && username.length > 0 && validateUser === true && term === true,
    }

    useEffect(() => {
        if (Object.keys(match.params).length) {
            setUsernameSponsor(match.params.username)

            validateUsernameSponsor(match.params.username)
        } else {
            setUsernameSponsor('')
        }

        try {
            Axios.get(`${urlServer}/collection/investment-plan`)
                .then(response => {
                    setPlan(response.data)
                })
                .catch(reason => {
                    console.log(reason)

                    throw reason
                }).finally(_ => setLoader(false))
        } catch (error) {
            Toast('error', error)
        }
    }, [])

    /**Function handled submit form */
    const onSubmitInformation = () => {
        const data = {
            firstname: firstName,
            lastname: lastname,
            email,
            phone: `${Countries[Number(country)].phoneCode} ${phone}`,
            country: Countries[Number(country)].name,
            hash,
            username,
            password,
            walletBTC,
            walletETH,
            id_investment_plan: Number(investmentPlan),
            username_sponsor: usernameSponsor
        }


        console.log(data)
    }


    /**Validate user register form */
    const validateUsername = async () => {
        setLoader(true)
        try {
            if (username.length > 5) {
                await Axios.post(`${urlServer}/comprobate/username`, { username })
                    .then((response) => {
                        console.log(response)
                        setValidateUser(response.data.length === 0)
                    })
                    .catch(reason => {
                        throw reason
                    })
            } else {
                setValidateUser(false)
            }
        } catch (error) {
            Toast('error', error)
        } finally {
            setLoader(false)
        }
    }

    /**Function validate user sponsor */
    const validateUsernameSponsor = async (username = '') => {
        setLoader(true)

        try {
            if (username.length > 0) {
                await Axios.post(`${urlServer}/comprobate/username`, { username })
                    .then((response) => {
                        console.log(response.data)
                        if (response.data.length > 0) {
                            setValidateUserSponsor(true)
                        } else {
                            setRedirect(true)
                            setValidateUserSponsor(false)
                            
                            setTimeout(() => {
                                setValidateUserSponsor(null)
                                setUsernameSponsor('')
                            }, 5000)
                        }
                    })
                    .catch(reason => {
                        throw reason
                    })
            }
        } catch (error) {
            console.log(error)
            Toast('error', error)
        } finally {
            setLoader(false)
        }
    }

    return (
        <div className="container-register">
            <div className="cover-image">
                {/* <h1>registrate gratis</h1> */}
            </div>

            <div className="form-container">
                {
                    redirect &&
                    <Redirect to='/register' />
                }

                {
                    (validateUserSponsor !== null) &&
                    <>
                        {
                            validateUserSponsor
                                ? <div className="sponsor-message valid">Registro patrocinado por {usernameSponsor}</div>
                                : <div className="sponsor-message invalid">Sponsor "{usernameSponsor}" no es valido</div>
                        }
                    </>
                }

                <img className="image-logo" src={Logo} alt="logo" />

                {
                    tabActive === 1 &&
                    <div className="tab">
                        <h2>Informacion basica</h2>

                        <div className="row">
                            <span className="required">Nombre</span>

                            <input value={firstName} onChange={e => setFirstname(e.target.value)} type="text" className="text-input" />
                        </div>

                        <div className="row">
                            <span className="required">Apellido</span>

                            <input value={lastname} onChange={e => setLastname(e.target.value)} type="text" className="text-input" />
                        </div>

                        <div className="row">
                            <span className="required">Correo Electronico</span>

                            <input value={email} onChange={e => setEmail(e.target.value)} type="text" className="text-input" />
                        </div>

                        <div className="row">
                            <span className="required">Pais</span>

                            <select className="picker" value={country} onChange={e => setCountry(e.target.value)}>
                                {Countries.map(
                                    ({ name }, index) => <option value={index} key={index}>{name}</option>
                                )}
                            </select>
                        </div>

                        <div className="row">
                            <span className="required">Numero telefonico</span>

                            <input value={phone} onChange={e => setPhone(e.target.value)} type="text" className="text-input" />
                        </div>

                        <div className="collection-buttons">
                            <Link to="/" className="link">Iniciar sesion</Link>
                            <button className="button no-border" disabled={!validationButtons.first} onClick={_ => setTab(2)}>Siguiente</button>
                        </div>
                    </div>
                }

                {
                    tabActive === 2 &&
                    <div className="tab">
                        <h2>Informacion de transaccion</h2>

                        <div className="row">
                            <span className="required">Hash de transaccion</span>

                            <input value={hash} onChange={e => setHash(e.target.value)} type="text" className="text-input" />
                        </div>

                        <div className="row">
                            <span className="required">Direccion Wallet BTC</span>

                            <input value={walletBTC} onChange={e => setWalletBTC(e.target.value)} type="text" className="text-input" />
                        </div>

                        <div className="row">
                            <span className="required">Direccion Wallet ETH</span>

                            <input value={walletETH} onChange={e => setWalletETH(e.target.value)} type="text" className="text-input" />
                        </div>

                        <div className="collection-buttons">
                            <button className="button no-border" onClick={_ => setTab(1)}>Atras</button>
                            <button className="button no-border" disabled={!validationButtons.second} onClick={_ => setTab(3)}>Siguiente</button>
                        </div>
                    </div>
                }

                {
                    tabActive === 3 &&
                    <div className="tab">
                        <h2>Plan de inversion</h2>


                        <div className="row">
                            <span>Moneda</span>

                            <select className="picker" value={crypto} onChange={e => setCrypto(e.target.value)}>
                                <option value={1}>Bitcoin (BTC)</option>
                                <option value={2}>Ethereum (ETH)</option>
                            </select>
                        </div>

                        <div className="row investment-plan">
                            <span className="required">Plan de inversion</span>

                            <div className="plan">
                                {
                                    (loader && plan.length === 0) &&

                                    <ActivityIndicator />
                                }

                                {plan.map((item, index) => {
                                    if (item.id_currency === Number(crypto)) {
                                        return (
                                            <div className="element" key={index}>
                                                <input onChange={e => setInvestmentPlan(e.target.value)} value={item.id} type="radio" id={`plan-${index}`} className="check" name="plan" />
                                                <label htmlFor={`plan-${index}`}>
                                                    {item.amount}
                                                    {item.id_currency === 1 && ' BTC'}
                                                    {item.id_currency === 2 && ' ETH'}
                                                </label>
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                        </div>

                        <div className="collection-buttons">
                            <button className="button no-border" onClick={_ => setTab(2)}>Atras</button>
                            <button className="button no-border" disabled={!validationButtons.third} onClick={_ => setTab(4)}>Siguiente</button>
                        </div>
                    </div>
                }

                {
                    tabActive === 4 &&
                    <div className="tab">
                        <h2>Seguridad</h2>

                        <div className="row">
                            <span className="required comprobate">
                                Usuario

                                {
                                    loader &&
                                    <ActivityIndicator size={24} />
                                }

                                {
                                    (validateUser !== null) &&
                                    <>
                                        {
                                            validateUser
                                                ? <span className="valid">Usuario valido</span>
                                                : <span className="invalid">El usuario ya existe</span>
                                        }
                                    </>
                                }
                            </span>

                            <input value={username} onBlur={validateUsername} onChange={e => setUsername(e.target.value)} type="text" className="text-input" />
                        </div>

                        <div className="row">
                            <span className="required">Contraseña</span>

                            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="text-input" />
                        </div>

                        <div className="row">
                            <span className="required">Confirmar Contraseña</span>

                            <input value={passwordSecurity} onChange={e => setPasswordSecurity(e.target.value)} type="password" className="text-input" />
                        </div>

                        <div className="terms">
                            <label htmlFor="terms-input">He leído términos y condiciones</label>

                            <input type="checkbox" id="terms-input" onChange={e => setTerms(!term)} />
                        </div>

                        <div className="collection-buttons">
                            <button className="button no-border" onClick={_ => setTab(3)}>Atras</button>
                            <button className="button secondary no-border" disabled={!validationButtons.fourth || loader} onClick={onSubmitInformation}>
                                {
                                    loader
                                        ? <ActivityIndicator size="14" />
                                        : 'Enviar'
                                }
                            </button>
                        </div>
                    </div>
                }

                <div className="read-term">
                    <a href="#" className="view-terms" onClick={e => {
                        e.preventDefault()

                        setModal(true)
                    }}>
                        Terminos y condiciones
                    </a>
                </div>
            </div>

            <ModalTerms isVisible={modal} onClose={e => setModal(false)} />
        </div>
    )
}

export default Register