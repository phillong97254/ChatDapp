// ===== DEPLOY P2Pchat UUPS PROXY TRÊN REMIX (FIX GAS LIMIT) =====
// Tương thích ethers.js thuần (không Hardhat) - Test OK 29/11/2025

(async () => {
    try {
        // Lấy signer từ Remix (MetaMask hoặc VM)
        const signer = await ethers.getSigner(); // Địa chỉ ví hiện tại của bạn
        const ownerAddress = await signer.getAddress();
        console.log("Deploying with owner:", ownerAddress);

        // 1. Deploy IMPLEMENTATION contract (P2Pchat)
        console.log("Deploying P2Pchat implementation...");
        const P2PchatFactory = await ethers.getContractFactory("P2Pchat", signer);
        const implementation = await P2PchatFactory.deploy();
        await implementation.waitForDeployment();
        const implAddress = await implementation.getAddress();
        console.log("Implementation deployed at:", implAddress);

        // 2. Encode dữ liệu initialize (gọi hàm initialize với owner)
        const initializeAbi = ["function initialize(address initialOwner)"];
        const initializeIface = new ethers.Interface(initializeAbi);
        const initData = initializeIface.encodeFunctionData("initialize", [ownerAddress]);

        // 3. Deploy ERC1967Proxy (UUPS pattern) với gas limit AN TOÀN (15M < 16.7M cap)
        console.log("Deploying UUPS Proxy...");
        const ProxyFactory = await ethers.getContractFactory("ERC1967Proxy", signer);
        const proxy = await ProxyFactory.deploy(implAddress, initData, {
            gasLimit: 15000000  // FIX: Giới hạn gas để tránh lỗi "too high"
        });
        await proxy.waitForDeployment();
        const proxyAddress = await proxy.getAddress();
        console.log("Proxy deployed at:", proxyAddress);

        // 4. Attach ABI của P2Pchat vào proxy để gọi hàm
        const chat = P2PchatFactory.attach(proxyAddress);

        // 5. Verify: Kiểm tra owner và các giá trị init
        console.log("Verifying initialization...");
        const owner = await chat.owner();
        const fee = await chat.getMessageFee();
        const maxLen = await chat.getMaxMessageLength();
        const version = await chat.getVersion();
        console.log("Owner set to:", owner);
        console.log("Message fee:", ethers.formatEther(fee), "ETH");
        console.log("Max message length:", maxLen.toString());
        console.log("Version:", version);

        // Nếu OK → Copy địa chỉ proxy để dùng test gas sau
        console.log("\n🚀 DEPLOY THÀNH CÔNG! Sử dụng proxy address sau để test:");
        console.log(proxyAddress);

    } catch (error) {
        console.error("Deploy failed:", error);
    }
})();