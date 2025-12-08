import { motion } from "framer-motion";

export function InvoiceCard() {
  return (
    <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative w-full max-w-sm mx-auto lg:max-w-none"
    >
        {/* Outer Frame - Dark, industrial, glowing outline */}
        <div className="relative p-3 rounded-xl bg-gray-900 border-4 border-yellow-600/60 shadow-[0_0_25px_rgba(253,176,34,0.5),inset_0_0_15px_rgba(0,0,0,0.5)] transform rotate-1 transition-all duration-500 ease-out">
        
        {/* Heavy-duty corner screws/rivets */}
        {[
            "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
            "top-0 right-0 translate-x-1/2 -translate-y-1/2",
            "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
            "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
        ].map((position, index) => (
            <div key={index} className={`absolute w-6 h-6 bg-gray-800 rounded-full border-4 border-gray-600 shadow-inner shadow-black/80 z-20 ${position}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
        ))}

        {/* Inner Screen/Content Area */}
        <div className="h-[550px] bg-gray-900 rounded-lg shadow-inner shadow-black/50 overflow-hidden relative">
            {/* Top Header/Bezel */}
            <div className="bg-gray-800 p-3 flex justify-between items-center border-b border-gray-700">
            <div className="text-sm text-yellow-500 font-bold tracking-widest">WELDGE</div>
            <div className="text-xs text-gray-500">FT: 10:24 AM</div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-gray-800/50 border-b border-gray-700">
            <div className="p-2 px-4 text-white font-semibold border-b-2 border-yellow-500">Invoice</div>
            <div className="p-2 px-4 text-gray-400 hover:text-white transition-colors">Details</div>
            <div className="p-2 px-4 text-gray-400 hover:text-white transition-colors">Invoices</div>
            <div className="p-2 px-4 text-gray-400 hover:text-white transition-colors">Homes</div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 space-y-4 text-white">
            <div className="flex justify-between items-start border-b border-gray-800 pb-4">
                <div>
                <p className="text-xl font-bold tracking-tight text-gray-100">WORKZONE</p>
                <p className="text-sm text-gray-400 uppercase font-medium">CONTRACTORS</p>
                </div>
                <div className="text-right">
                <span className="text-xs text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">60 min</span>
                <p className="text-xs text-gray-500 mt-1">Percley</p>
                </div>
            </div>
            
            {/* Invoice Details Block */}
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                <span className="text-gray-400">Invoice</span>
                <span className="text-gray-100 font-medium">Inv005 Bt 16</span>
                </div>
                <div className="flex justify-between text-sm">
                <span className="text-gray-400">11/13/2024</span>
                <span className="text-gray-100 font-medium">1.02-5075</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-800 pb-3">
                <span className="text-gray-400">Internal</span>
                <span className="text-gray-100 font-medium">Internal</span>
                </div>
            </div>

            {/* Subtotal Section */}
            <div className="space-y-3 pt-3">
                <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-100">Invoice</span>
                <span className="text-2xl font-bold text-yellow-400">$5,300</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                <span>Tools & Surcharges</span>
                <span>$ 5,300</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                <span>Perm. Tour</span>
                <span>$ 5,300</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-100 border-t border-gray-700 pt-3">
                <span>Total</span>
                <span>$ 5,300</span>
                </div>
            </div>
            
            {/* Activity/Punch List */}
            <div className="space-y-4 pt-4 border-t border-gray-800">
                <div className="flex justify-between text-sm text-gray-300">
                <span>Punch List</span>
                <span>Activity</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                <span>Preview</span>
                <span>PAID.S.1</span>
                </div>
            </div>
            
            </div>

            {/* Bottom indicator / light strip */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-600/50 shadow-lg shadow-yellow-500/20"></div>
        </div>
        </div>
    </motion.div>
);
}