const machineId = require('node-machine-id')

const getElectronVersion = () => {
    return process.versions.electron
}

// 获取硬件uuid
const getHardwareUUID = () => {
    const uuid = machineId.machineIdSync({ original: true })
    return uuid
}
export { getElectronVersion, getHardwareUUID }
