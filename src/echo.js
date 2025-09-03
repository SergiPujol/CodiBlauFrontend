import Echo from 'laravel-echo'
import io from 'socket.io-client'

window.io = io

const echo = new Echo({
    broadcaster: 'socket.io',
    host: window.location.hostname + ':6001',
    transports: ['websocket'],
    forceTLS: false,
    disableStats: true,
})

echo.connector.socket.on('connect', () => {
    console.log('✅ WebSocket connectat')
})

echo.connector.socket.on('connect_error', (err) => {
    console.error('❌ WebSocket connect_error:', err)
})

echo.connector.socket.on('error', (err) => {
    console.error('❌ WebSocket error:', err)
})
console.log('echo.js carregat')
export default echo
