import React, { useEffect, useReducer } from "react"
import { useSelector } from "react-redux"

// Import styles
import "./HeaderDashboard.scss"

// Import Assets
import LogoBTC from "../../static/icons/bitcoin.svg"
import LogoETH from "../../static/icons/ether.svg"

// Import components and methods
import ProgressBar from "../ProgressBar/ProgressBar"
import Swal from "sweetalert2"
import validator from "validator"
import { Petition, wallets, copyData, calculateCryptoPrice } from "../../utils/constanst"

const images = {
    btc: LogoBTC,
    eth: LogoETH,
}

const initialState = {
    // Estado que indica si el usuario hara su transaccion con airtm
    airtm: false,

    // Estado que inica el proceso de traer precios de la coinmarketcao
    loaderCoinmarketCap: false,

    // Estado que guarda el monto aproximado del momento cuando el usuario
    // Paga con montos de Airtm (USD)
    aproximateAmount: 0,

    // Estado que indica si se muestra el loader
    loader: false,

    // Estado que guarda el hash de transaccion o Numero de transaccion Airtm
    hash: "",

    // Estado que guarda el correo de transaccion Airtm
    emailAirtm: "",

    // Estado que guarda el monto seleccionado por el usuario
    plan: 0,

    // Estado que guarda los montos servidos del backend
    list: [],

    // Estado que guarda la presencia de la modal de upgrade
    showModal: false,

    // Estado que guarda la informacion de la coinmarketcap
    cryptoPrices: { BTC: null, ETH: null }

}

const reducer = (state, action) => {
    return {
        ...state,
        [action.type]: action.payload
    }
}


const HeaderDashboard = ({ type = "btc", amount = 0.5, amountToday = 2, idInvestment = 0, disabled = false }) => {
    const { token } = useSelector(({ globalStorage }) => globalStorage)

    const [state, dispatch] = useReducer(reducer, initialState)

    /**Constante que define el precio de moneda seleccionada */
    const cryptoPrice = state.cryptoPrices.BTC !== null
        ? type.toLocaleLowerCase() === "btc"
            ? state.cryptoPrices.BTC.quote.USD.price
            : state.cryptoPrices.ETH.quote.USD.price
        : 0

    const valuePorcent = amountToday / (amount * 2) * 100

    /**Metodo que active/desactiva ventana modal de upgrade */
    const toggleModal = () => {
        if (state.showModal === false) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }

        // setShowModal(!showModal)
        dispatch({ type: "showModal", payload: !state.showModal })
    }

    /**
     * Metodo que se ejecuta cuando el usuario quiere hacer Upgrade
     * */
    const onUpgrade = () => {
        toggleModal()

        const id_currency = type === 'btc' ? 1 : type === 'eth' ? 2 : 0

        if (state.showModal === false) {
            Petition.get(`/collection/investment-plan/${id_currency}`)
                .then(({ data }) => {
                    if (data) {
                        dispatch({ type: "list", payload: data })
                    } else {
                        Swal.fire(
                            'Ha ocurrido un error',
                            'No se ha podido cargar alguna infomacion, recargue de nuevo o contacte a soporte',
                            'error'
                        )
                    }
                })
        }

    }

    /**
     * Metodo que se ejecuta cuando el usuario ejecuta una solicitud de upgrade
     */
    const UpGradeExecute = async () => {
        try {
            dispatch({ type: "loader", payload: false })
            dispatch({ type: "loader", payload: true })

            if (state.plan === 0) {
                throw 'Seleccione un plan de inversion'
            }

            if (state.airtm && !validator.isEmail(state.emailAirtm)) {
                throw "Ingrese un correo de transacción valido"
            }

            if (state.hash.length < 8) {
                if (state.airtm) {
                    throw "Id de manipulacion Airtm Incorrecto"
                } else {
                    throw "Hash de transacción Incorrecto"
                }
            }

            const data = {
                airtm: state.airtm,
                emailAirtm: state.emailAirtm,
                aproximateAmountAirtm: state.aproximateAmount,
                amount: state.plan,
                id: idInvestment,
                hash: state.hash,
            }

            await Petition.post('/buy/upgrade', data, {
                headers: {
                    "x-auth-token": token
                }
            }).then(({ data }) => {
                if (data.error) {
                    throw data.message
                } else {
                    toggleModal()

                    dispatch({ type: "hash", payload: "" })
                    dispatch({ type: "airtm", payload: false })
                    dispatch({ type: "emailAirtm", payload: "" })

                    Swal.fire(
                        'Upgrade Completado',
                        'En breves momentos, estaremos atendiendo su peticion de UPGRADE',
                        'success'
                    )
                }
            }).catch(reason => {
                throw reason.toString()
            })
        } catch (error) {

            Swal.fire(
                'Ha ocurrido un error',
                error,
                'warning'
            )
        } finally {
            dispatch({ type: "loader", payload: false })
        }
    }

    /**Metodo que se ejecuta cuando el usuario cambia el plan de inversion */
    const onChangePrice = (e) => {
        const { value } = e.target

        dispatch({ type: "plan", payload: parseFloat(value) })

        // Verificamos si el usuario pagara con transaccion Airtm
        if (state.airtm) {
            // Sacamos el monto (USD) aproximado en el momento
            const amount = calculateCryptoPrice(cryptoPrice, parseFloat(value))

            dispatch({ type: "aproximateAmount", payload: parseFloat(amount) })
        }
    }

    /**
     * Obtiene los precios de la coinmarketcap
     * */
    const getAllPrices = async () => {
        dispatch({ type: "loaderCoinmarketCap", payload: true })

        await Petition.get("/collection/prices")
            .then(
                ({ data }) => {
                    if (data.error) {
                        Swal.fire("Ha ocurrido un error", data.message, "error")
                    } else {
                        const { BTC, ETH } = data

                        dispatch({ type: "cryptoPrices", payload: { BTC, ETH } })
                    }
                }
            )

        dispatch({ type: "loaderCoinmarketCap", payload: false })
    }

    useEffect(() => {
        if (state.showModal && state.airtm) {
            getAllPrices()

        }

        dispatch({ type: "plan", payload: 0 })
    }, [state.showModal, state.airtm])

    return (
        <>
            <div className="container-info-crypto">
                <img src={images[type]} className="crypto" alt="crypto" />

                <div className="info">
                    <div className="row-header">
                        <h1>{amount} {type.toUpperCase()}</h1>

                        <button className="button large secondary" onClick={onUpgrade} disabled={disabled}>Upgrade</button>
                    </div>

                    <div className="row-header progress">
                        {/* Progress bar */}
                        <ProgressBar value={valuePorcent} legend={`Ganado (${valuePorcent.toFixed(1)}%)`} />

                        {
                            valuePorcent < 40 &&
                            <span className="value-legend">{`Ganado (${valuePorcent.toFixed(1)}%)`}</span>
                        }
                    </div>
                </div>
            </div>


            {
                state.showModal &&
                <div className="modal-upgrade">
                    <div className="content">

                        <div className="m-header">
                            <h2>Invierte mas en tu plan - {type.toUpperCase()}</h2>

                            <div className="col-wallet">
                                {
                                    !state.airtm &&
                                    <span className="wallet" onClick={_ => copyData(wallets[type])}>
                                        {
                                            wallets[type]
                                        }
                                    </span>
                                }

                                {
                                    state.airtm &&
                                    <span className="wallet" onClick={_ => copyData(wallets.airtm)}>
                                        {
                                            wallets.airtm
                                        }
                                    </span>
                                }
                            </div>
                        </div>

                        <div className="row">
                            <div className="col">
                                <span>Selecciona un plan de inversion</span>

                                <select disabled={state.loaderCoinmarketCap} className="picker" value={state.plan} onChange={onChangePrice}>
                                    <option value={0} disabled>Seleccion tu plan</option>
                                    {
                                        !state.airtm &&
                                        <>
                                            {
                                                state.list.map((item, index) => <option value={item.amount} key={index}>{item.amount} {type.toUpperCase()}</option>)
                                            }
                                        </>
                                    }

                                    {
                                        (state.airtm && state.cryptoPrices.BTC !== null) &&
                                        <>
                                            {
                                                state.list.map((item, index) => {
                                                    return (
                                                        <option value={item.amount} key={index}>
                                                            $ {calculateCryptoPrice(cryptoPrice, item.amount)}
                                                        </option>
                                                    )
                                                })
                                            }
                                        </>
                                    }
                                </select>

                            </div>
                            <div className="col">

                                {
                                    state.airtm
                                        ? <span>Id de manipulacion Airtm</span>
                                        : <span>Ingresa el hash de la transaccion</span>
                                }

                                <input
                                    type="text"
                                    value={state.hash}
                                    onChange={e => dispatch({ type: "hash", payload: e.target.value })}
                                    className="text-input" />
                            </div>
                        </div>

                        {
                            state.airtm &&
                            <div className="row flex-end">
                                <div className="col">

                                    <span>Correo de transaccion Airtm</span>

                                    <input
                                        type="text"
                                        value={state.emailAirtm}
                                        onChange={e => dispatch({ type: "emailAirtm", payload: e.target.value })}
                                        className="text-input" />
                                </div>
                            </div>
                        }

                        <div className="footer-modal">
                            <div className="airtm-row">
                                <input type="checkbox" checked={state.airtm} onChange={_ => dispatch({ type: "airtm", payload: !state.airtm })} name="airtm" id="check-airtm" />

                                <label htmlFor="check-airtm">Pagar con Airtm</label>
                            </div>

                            <div className="buttons">
                                <button className="button" disabled={state.loader} onClick={toggleModal}>Cancelar</button>
                                <button className="button secondary" disabled={state.loader} onClick={UpGradeExecute}>UPGRADE</button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default HeaderDashboard