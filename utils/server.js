import { dirname } from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import session from "express-session"
import bodyParser from "body-parser"
import cors from 'cors'
import { zkSyncClean, zkSyncData, zkSyncFetchWallet } from "../checkers/zksync.js"
import { zoraClean, zoraData, zoraFetchWallet } from "../checkers/zora.js"
import { baseClean, baseData, baseFetchWallet } from "../checkers/base.js"
import { aptosClean, aptosData, aptosFetchWallet } from "../checkers/aptos.js"
import { lineaClean, lineaData, lineaFetchWallet } from "../checkers/linea.js"
import { scrollClean, scrollData, scrollFetchWallet } from "../checkers/scroll.js"
import { balancesData } from "../checkers/balances.js"
import { evmData } from "../checkers/evm.js"
import { readWallets } from "./common.js"
import { layerzeroClean, layerzeroData, layerzeroFetchWallet } from "../checkers/layerzero.js"
import { wormholeClean, wormholeData, wormholeFetchWallet } from '../checkers/wormhole.js'
import { zkbridgeClean, zkbridgeData, zkbridgeFetchWallet } from '../checkers/zkbridge.js'
import { hyperlaneClean, hyperlaneData, hyperlaneFetchWallet } from '../checkers/hyperlane.js'
import { clustersClean, clustersData, clustersFetchWallet } from '../checkers/clusters.js'
import { debridgeClean, debridgeData, debridgeFetchWallet } from '../checkers/debridge.js'
import { config } from '../user_data/config.js'
import { chainFetchData, rabbyClean, rabbyData, rabbyFetchWallet } from '../checkers/rabby.js'
import { nftClean, nftData, nftFetchWallet } from '../checkers/nft.js'
import { galxeData } from '../checkers/galxe.js'
import { polygonzkevmClean, polygonzkevmData, polygonzkevmFetchWallet } from '../checkers/polygonzkevm.js'
import { jumperClean, jumperData, jumperFetchWallet } from '../checkers/jumper.js'
import { storyClean, storyData, storyFetchWallet } from '../checkers/story.js'

const app = express()
const port = config.port
const apiRoutes = express.Router()

app.use(bodyParser.json())
app.use(
    session({
        secret: "walletcheckerbymunris",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, maxAge: 360000000 }
    })
)

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (username === config.auth.login && password === config.auth.password) {
        req.session.isAuthenticated = true
        req.session.username = username
        res.json({ message: "Login successful" })
    } else {
        res.status(401).json({ message: "Invalid credentials" })
    }
})

function isAuthenticated(req, res, next) {
    if (!config.auth.enabled) {
        next()
    } else {   
        if (req.session.isAuthenticated) {
            next()
        } else {
            res.sendStatus(401)
        }
    }
}

app.use(cors())
app.use('/api', apiRoutes)

app.use(express.static('./web/dist'))

app.get('*', (req, res) => {
    res.sendFile('./web/dist/index.html')
})

apiRoutes.get('/stats', async (req, res) => {
    const zksyncWallets = readWallets(config.modules.zksync.addresses)
    const layerzeroWallets = readWallets(config.modules.layerzero.addresses)
    const wormholeWallets = readWallets(config.modules.wormhole.addresses)
    const debridgeWallets = readWallets(config.modules.debridge.addresses)
    const zkbridgeWallets = readWallets(config.modules.zkbridge.addresses)
    const hyperlaneWallets = readWallets(config.modules.hyperlane.addresses)
    const zoraWallets = readWallets(config.modules.zora.addresses)
    const baseWallets = readWallets(config.modules.base.addresses)
    const aptosWallets = readWallets(config.modules.aptos.addresses)
    const lineaWallets = readWallets(config.modules.linea.addresses)
    const scrollWallets = readWallets(config.modules.scroll.addresses)
    const polygonzkevmWallets = readWallets(config.modules.polygonzkevm.addresses)
    const clustersWallets = readWallets(config.modules.clusters.addresses)
    const rabbyWallets = readWallets(config.modules.rabby.addresses)
    const evmWallets = readWallets(config.modules.evm.addresses)
    const balanceWallets = readWallets(config.modules.balance.addresses)
    const nftWallets = readWallets(config.modules.nft.addresses)
    const galxeWallets = readWallets(config.modules.galxe.addresses)
    const jumperWallets = readWallets(config.modules.jumper.addresses)
    const storyWallets = readWallets(config.modules.story.addresses)

    res.json({
        'config': config,
        'zksync_wallets': zksyncWallets,
        'layerzero_wallets': layerzeroWallets,
        'zkbridge_wallets': zkbridgeWallets,
        'hyperlane_wallets': hyperlaneWallets,
        'wormhole_wallets': wormholeWallets,
        'debridge_wallets': debridgeWallets,
        'zora_wallets': zoraWallets,
        'base_wallets': baseWallets,
        'aptos_wallets': aptosWallets,
        'linea_wallets': lineaWallets,
        'scroll_wallets': scrollWallets,
        'polygonzkevm_wallets': polygonzkevmWallets,
        'clusters_wallets': clustersWallets,
        'rabby_wallets': rabbyWallets,
        'evm_wallets': evmWallets,
        'balance_wallets': balanceWallets,
        'nft_wallets': nftWallets,
        'galxe_wallets': galxeWallets,
        'jumper_wallets': jumperWallets,
        'story_wallets': storyWallets,
    })
})

// JUMPER API
apiRoutes.get('/jumper', isAuthenticated, async (req, res) => {
    const responseData = await jumperData()
    res.json(responseData)
})

apiRoutes.get('/jumper/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await jumperFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/jumper/clean', isAuthenticated, async (req, res) => {
    await jumperClean()
    res.json(true)
})

// ZKSYNC API
apiRoutes.get('/zksync', isAuthenticated, async (req, res) => {
    const responseData = await zkSyncData()
    res.json(responseData)
})

apiRoutes.get('/zksync/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await zkSyncFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/zksync/clean', isAuthenticated, async (req, res) => {
    await zkSyncClean()
    res.json(true)
})

// WORMHOLE API
apiRoutes.get('/wormhole', isAuthenticated, async (req, res) => {
    const responseData = await wormholeData()
    res.json(responseData)
})

apiRoutes.get('/wormhole/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await wormholeFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/wormhole/clean', isAuthenticated, async (req, res) => {
    await wormholeClean()
    res.json(true)
})

// DEBRIDGE API
apiRoutes.get('/debridge', isAuthenticated, async (req, res) => {
    const responseData = await debridgeData()
    res.json(responseData)
})

apiRoutes.get('/debridge/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await debridgeFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/debridge/clean', isAuthenticated, async (req, res) => {
    await debridgeClean()
    res.json(true)
})

// LAYERZERO API
apiRoutes.get('/layerzero', isAuthenticated, async (req, res) => {
    const responseData = await layerzeroData()
    res.json(responseData)
})

apiRoutes.get('/layerzero/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await layerzeroFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/layerzero/clean', isAuthenticated, async (req, res) => {
    await layerzeroClean()
    res.json(true)
})

// ZKBRIDGE API
apiRoutes.get('/zkbridge', isAuthenticated, async (req, res) => {
    const responseData = await zkbridgeData()
    res.json(responseData)
})

apiRoutes.get('/zkbridge/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await zkbridgeFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/zkbridge/clean', isAuthenticated, async (req, res) => {
    await zkbridgeClean()
    res.json(true)
})

// HYPERLANE API
apiRoutes.get('/hyperlane', isAuthenticated, async (req, res) => {
    const responseData = await hyperlaneData()
    res.json(responseData)
})

apiRoutes.get('/hyperlane/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await hyperlaneFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/hyperlane/clean', isAuthenticated, async (req, res) => {
    await hyperlaneClean()
    res.json(true)
})

// ZORA API
apiRoutes.get('/zora', isAuthenticated, async (req, res) => {
    const responseData = await zoraData()
    res.json(responseData)
})

apiRoutes.get('/zora/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await zoraFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/zora/clean', isAuthenticated, async (req, res) => {
    await zoraClean()
    res.json(true)
})

// BASE API
apiRoutes.get('/base', isAuthenticated, async (req, res) => {
    const responseData = await baseData()
    res.json(responseData)
})

apiRoutes.get('/base/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await baseFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/base/clean', isAuthenticated, async (req, res) => {
    await baseClean()
    res.json(true)
})

// APTOS API
apiRoutes.get('/aptos', isAuthenticated, async (req, res) => {
    const responseData = await aptosData()
    res.json(responseData)
})

apiRoutes.get('/aptos/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await aptosFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/aptos/clean', isAuthenticated, async (req, res) => {
    await aptosClean()
    res.json(true)
})

// LINEA API
apiRoutes.get('/linea', isAuthenticated, async (req, res) => {
    const responseData = await lineaData()
    res.json(responseData)
})

apiRoutes.get('/linea/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await lineaFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/linea/clean', isAuthenticated, async (req, res) => {
    await lineaClean()
    res.json(true)
})

// SCROLL API
apiRoutes.get('/scroll', isAuthenticated, async (req, res) => {
    const responseData = await scrollData()
    res.json(responseData)
})

apiRoutes.get('/scroll/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await scrollFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/scroll/clean', isAuthenticated, async (req, res) => {
    await scrollClean()
    res.json(true)
})

// POLYGONZKEVM API
apiRoutes.get('/polygonzkevm', isAuthenticated, async (req, res) => {
    const responseData = await polygonzkevmData()
    res.json(responseData)
})

apiRoutes.get('/polygonzkevm/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await polygonzkevmFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/polygonzkevm/clean', isAuthenticated, async (req, res) => {
    await polygonzkevmClean()
    res.json(true)
})

// CLUSTERS API
apiRoutes.get('/clusters', isAuthenticated, async (req, res) => {
    const responseData = await clustersData()
    res.json(responseData)
})

apiRoutes.get('/clusters/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await clustersFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/clusters/clean', isAuthenticated, async (req, res) => {
    await clustersClean()
    res.json(true)
})

// STORY API
apiRoutes.get('/story', isAuthenticated, async (req, res) => {
    const responseData = await storyData()
    res.json(responseData)
})

apiRoutes.get('/story/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await storyFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/story/clean', isAuthenticated, async (req, res) => {
    await storyClean()
    res.json(true)
})

// RABBY API
apiRoutes.get('/rabby', isAuthenticated, async (req, res) => {
    const responseData = await rabbyData()
    res.json(responseData)
})

apiRoutes.get('/rabby-chain', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet
    const chainId = req.query.chainId
    const responseData = await chainFetchData(wallet, chainId)
    res.json(responseData)
})

apiRoutes.get('/rabby/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await rabbyFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/rabby/clean', isAuthenticated, async (req, res) => {
    await rabbyClean()
    res.json(true)
})

// NFT API
apiRoutes.get('/nft', isAuthenticated, async (req, res) => {
    const responseData = await nftData()
    res.json(responseData)
})

apiRoutes.get('/nft/refresh', isAuthenticated, async (req, res) => {
    const wallet = req.query.wallet ? req.query.wallet : ''
    await nftFetchWallet(wallet)
    res.json(true)
})

apiRoutes.get('/nft/clean', isAuthenticated, async (req, res) => {
    await nftClean()
    res.json(true)
})

// BALANCES API
apiRoutes.get('/balances', isAuthenticated, async (req, res) => {
    const network = req.query.network ? req.query.network : 'eth'
    const responseData = await balancesData(network)
    res.json(responseData)
})

// EVM API
apiRoutes.get('/evm', isAuthenticated, async (req, res) => {
    const network = req.query.network ? req.query.network : 'eth'
    const responseData = await evmData(network)
    res.json(responseData)
})

// GALXE API
apiRoutes.get('/galxe', isAuthenticated, async (req, res) => {
    const space = req.query.space ? req.query.space : 'caldera'
    const responseData = await galxeData(space)
    res.json(responseData)
})

app.listen(port, () => {
    console.log(`Wallet checker web version started: http://localhost${port == 80 ? '' : ':' + port}`)
})