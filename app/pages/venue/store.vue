<script setup lang="ts">
definePageMeta({
    layout: 'venue'
})

import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { api } from '~/services/api'
import { formatNumber } from '#imports'
import type { ApiResponse, StoreCart, StoreProduct, TransactionData } from '~/types'

type Final = {
    name: string
    stock: number
    image_url: string
}
type notifAddStock = {
  added: number
  final: Final
}

const formattedAmount = ref('')

const formatRupiah = (value: string) => {
  const number = value.replace(/\D/g, '')
  if (!number) return ''
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(number))
}

const onInputAmount = (e: Event) => {
  const target = e.target as HTMLInputElement

  const raw = target.value.replace(/\D/g, '')

  amount.value = raw ? Number(raw) : null
  formattedAmount.value = raw ? formatRupiah(raw) : ''
}

const loadingProduct = ref(false)
const loadingShowStock = ref(false)

const amount = ref<number | null>(null)
const products = ref<StoreProduct[]>([])
const newProduct = ref<StoreProduct>()
const newStock = ref<notifAddStock>()
const newPrice = ref<StoreProduct>()
const deletedProduct = ref<StoreProduct>()
const selectedModifyProduct = ref<any | null>(null)
const selectedAddToCartProduct = ref<any | null>(null)
const addItemQuantity = ref()
const minItemQuantity = ref()
const quantity = ref(1)
const cart = ref<StoreCart[]>([])
const totalPrice = ref('')
const payment_method = ref('Cash')
const transaction = ref<TransactionData>()

const showAddProduct = ref(false)
const modify = ref(false)
const order = ref(true)
const modifySelection = ref(false)
const modifyProduct = ref(false)
const showPricing = ref(false)
const showAddStock = ref(false)

const showNotifNewProduct = ref(false)
const showNotifDelete = ref(false)
const showNotifAddStock = ref(false)
const showNotifCancelTransaction = ref(false)
const showNotifCreateTransaction = ref(false)
const showNotifPrice = ref(false)
const showCartList = ref(false)
const showCartListMobile = ref(false)


const openCartlistMobile = () => {
    showCartListMobile.value = true
    activeModal.value = 'cart'
}
const openCartlist = () => {
    showCartList.value = true
    activeModal.value = 'cart'
}
const closeCartList = () => {
    showCartListMobile.value = false
    showCartList.value = false
    activeModal.value = null
}

const openAddProduct = () => {
    showAddProduct.value = true
    activeModal.value = 'addProduct'
}
const closeAddProduct = () => {
    showAddProduct.value = false
    amount.value = null
    newProductInput.value.product_type = ''
    newProductInput.value.name = ''
    newProductInput.value.stock = null
    newProductInput.value.image = null
}
const openModify = () => {
    modify.value = true
    order.value = false
}
const openOrder = () => {
    modify.value = false
    order.value = true
}


const openModifyProduct = (product: StoreProduct) => {
    selectedModifyProduct.value = product
    modifyProduct.value = true
    modifySelection.value = true
    activeModal.value = 'modify'
}
const closeModifyProduct = () => {
    modifyProduct.value = false
    modifySelection.value = false
    showAddStock.value = false
    showPricing.value = false
    selectedModifyProduct.value = null
}
const openAddStock = () => {
    showAddStock.value = true
    modifySelection.value = false
}
const openPricing = () => {
    showPricing.value = true
    modifySelection.value = false
}
const backModify = () => {
    showAddStock.value = false
    showPricing.value = false
    modifySelection.value = true
}


const filter = reactive({
    search: '',
    product_type: '',
    stock: ''
})

const fetchProduct = async () => {
    loadingProduct.value = true
    try {
        const res: ApiResponse<StoreProduct[]> = await api('/store/product', {
            query: {
                search: filter.search || undefined,
                type: filter.product_type || undefined,
                stock: filter.stock || undefined
            }
        })
        products.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loadingProduct.value = false
    }
}

const addStockBody = reactive({
    Id: '',
    stock: ''
})

let notifTimeout: any = null

const addStock = async () => {
    try {
        const res: ApiResponse<notifAddStock> = await api('/store/addStock', {
            method: 'POST',
            body: {
                id: selectedModifyProduct.value,
                stock: addStockBody.stock
            }
        })

        fetchProduct()
        closeModifyProduct()
        newStock.value = res.data
        showNotifAddStock.value = true
        addStockBody.stock = ''
        if (notifTimeout) clearTimeout(notifTimeout)

        setTimeout(() => {
            showNotifAddStock.value = false
        }, 4000)
    } catch (e) {
        console.error(e)
    }
}

const changePrice = async () => {
    try {
        const res: ApiResponse<StoreProduct> = await api('/store/changePrice', {
            method: 'POST',
            body: {
                id: selectedModifyProduct.value,
                price: amount.value
            }
        })
        fetchProduct()
        closeModifyProduct()
        newPrice.value = res.data
        showNotifPrice.value = true
        amount.value = null
        if (notifTimeout) clearTimeout(notifTimeout)

        setTimeout(() => {
            showNotifPrice.value = false
        }, 4000)
    } catch (e) {
        console.error(e)
    }
}

const removeProduct = async () => {
    try {
        const res: ApiResponse<StoreProduct> = await api('/store/removeProduct', {
            method: 'POST',
            body: {
                id: selectedModifyProduct.value
            }
        })
        fetchProduct()
        closeModifyProduct()
        deletedProduct.value = res.data
        showNotifDelete.value = true

        if (notifTimeout) clearTimeout(notifTimeout)

        setTimeout(() => {
            showNotifDelete.value = false
        }, 4000)
    } catch (e) {
        console.error(e)
    }
}

const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string | null>(null)

const triggerFileInput = () => {
    fileInput.value?.click()
}

const newProductInput = ref ({
    venue_id: '',
    product_type: '',
    name: '',
    stock: null,
    image: null as File | null
})

const handleImage = (e: Event) => {
    const target = e.target as HTMLInputElement

    if (target.files && target.files[0]) {
        const file = target.files[0]

        newProductInput.value.image = file

        // preview
        imagePreview.value = URL.createObjectURL(file)
    }
}

const addProduct = async () => {
    try {
        const formData = new FormData()

        formData.append('product_type', newProductInput.value.product_type)
        formData.append('name', newProductInput.value.name)
        formData.append('price', String(amount.value))
        formData.append('stock', String(newProductInput.value.stock))

        if (newProductInput.value.image) {
            formData.append('image', newProductInput.value.image)
        }

        const res: ApiResponse<StoreProduct> = await api('/store/addProduct', {
            method: 'POST',
            body: formData
        })

        fetchProduct()
        closeAddProduct()
        newProduct.value = res.data
        showNotifNewProduct.value = true

        if (notifTimeout) clearTimeout(notifTimeout)

        setTimeout(() => {
            showNotifNewProduct.value = false
        }, 4000)
    } catch (e) {
        console.error(e)
    }
}

const selectProduct = (product: StoreProduct) => {
    selectedAddToCartProduct.value = product
    activeModal.value = 'cart'
    addToCart()
}
const addQuantity = (product: StoreProduct) => {
    selectedAddToCartProduct.value = product
    quantity.value = 0
    minItemQuantity.value = 0
    addItemQuantity.value = 1
    addToCart()
}
const minQuantity = (product: StoreProduct) => {
    selectedAddToCartProduct.value = product
    quantity.value = 0
    minItemQuantity.value = 1
    addItemQuantity.value = 0
    addToCart()
}

const addToCart = async () => {
    try {
        const res: ApiResponse<StoreCart[]> = await api('/store/addToCart', {
            method: 'POST',
            body: {
                product_id: selectedAddToCartProduct.value.id,
                quantity: quantity.value,
                addQuantity: addItemQuantity.value,
                minQuantity: minItemQuantity.value
            }
        })

        fetchCart()
        openCartlist()
        cart.value = res.data
        totalPrice.value = res.total_price
    } catch (e) {
        console.error(e)
    }
}

const fetchCart = async () => {
    try {
        const res: ApiResponse<StoreCart[]> = await api('/store/indexCart')
        cart.value = res.data
        totalPrice.value = res.total_price

    } catch (e) {
        console.error(e)
    }
}

const createTransaction = async () => {
    try {
        const res: ApiResponse<TransactionData> = await api('/store/createTransaction', {
            method: 'POST',
            body: {
                payment_method: payment_method.value
            }
        })

        fetchCart()
        fetchProduct()
        showNotifCreateTransaction.value = true
        totalPrice.value = ''
        transaction.value = res.data
        if (notifTimeout) clearTimeout(notifTimeout)
        setTimeout(() => {
            showNotifCreateTransaction.value = false
        }, 4000)
    } catch (e) {
        console.error(e)
    }
}
const cancelTransaction = async () => {
    try {
        await api('/store/removeCart', {
            method: 'POST'
        })
        
        fetchCart()
        closeCartList()
        showNotifCancelTransaction.value = true
        totalPrice.value = ''
        if (notifTimeout) clearTimeout(notifTimeout)
        setTimeout(() => {
            showNotifCancelTransaction.value = false
        }, 4000)
    } catch (e) {
        console.error(e)
    }
}

const isInCart = (productId: number) => {
    return cart.value.some(item => item.product.id === productId)
}
const getCartItem = (productId: number) => {
    return cart.value.find(item => item.store_product_id === productId)
}
const getQuantity = (productId: number) => {
    return getCartItem(productId)?.quantity || 0
}

const inputQuantity = (product: StoreProduct, value: number) => {
    selectedAddToCartProduct.value = product
    quantity.value = value
    addItemQuantity.value = 0
    minItemQuantity.value = 0
    addToCart()
}

onMounted(fetchProduct)
onMounted(fetchCart)

const startY = ref(0)
const currentY = ref(0)
const isDragging = ref(false)

const scrollContainer = ref<HTMLElement | null>(null)

const isAtTop = ref(false)

const activeModal = ref< 'cart' | 'modify' | 'addProduct' | null>(null)

const onTouchStart = (e: TouchEvent) => {
  const el = scrollContainer.value

  // cek apakah scroll lagi di paling atas
  isAtTop.value = el ? el.scrollTop === 0 : true

  startY.value = e.touches[0]?.clientY ?? 0

  // cuma aktif drag kalau scroll di atas
  isDragging.value = isAtTop.value
}

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return

  currentY.value = e.touches[0]?.clientY ?? 0
}

const onTouchEnd = () => {
  if (!isDragging.value) return

  const diff = currentY.value - startY.value

  if (diff > 100) {
    if (activeModal.value === 'cart') {
      closeCartList()
    } else if (activeModal.value === 'modify') {
      closeModifyProduct()
    } else if (activeModal.value === 'addProduct') {
      closeAddProduct()
    }
  }

  isDragging.value = false
  currentY.value = 0
}

</script>

<template>
    <div class="flex flex-col lg:flex-row gap-2">
        <div class="flex flex-col gap-2 w-full">
            <div class="flex flex-col lg:flex-row gap-5 border p-4 rounded-lg justify-between bg-white w-full">
                <div class="flex flex-col lg:flex-row gap-3">
                    <div class="flex items-center border border-gray-300 px-2 gap-2 rounded-full text-[12px] w-full">
                        <Icon icon="glyphs:search-1-outline" class="text-gray-400" width="30" height="30" />
                        <input 
                        v-model="filter.search"
                        @input="fetchProduct()"
                        placeholder="Search Product Name"
                        class="py-2 outline-none w-full"
                        />
                    </div>
                    <div class="flex gap-2 w-full">
                        <div class="flex w-auto lg:w-2/3 py-1 items-center text-[12px] border border-gray-300 rounded-full px-2">
                            <Icon icon="wordpress:category" class="text-gray-300" width="24" height="24" />
                            <select
                                v-model="filter.product_type"
                                @change="fetchProduct()"
                                class="text-gray-400 appearance-none px-5 w-full focus:outline-none"
                            >
                                <option value="">Category</option>
                                <option value="Fnb">Food & Baverage</option>
                                <option value="Gear">Sports Gear</option>
                            </select>
                        </div>
                        <div class="flex w-auto lg:w-2/3 py-1 text-[12px] items-center border border-gray-300 rounded-full px-2">
                            <Icon icon="lsicon:management-stockout-outline" class="text-gray-300" width="24" height="24" />
                            <select
                                v-model="filter.stock"
                                @change="fetchProduct()"
                                class="text-gray-400 appearance-none px-5 w-full focus:outline-none"
                            >
                                <option value="">Stock</option>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="max-[1000px]:hidden flex gap-2 text-[12px] border-t pt-4 lg:pt-0 lg:border-t-0">
                    <button @click="openAddProduct" class="flex items-center gap-2 border-2 text-blue-900 border-blue-800 font-bold py-2 px-4 me-5 rounded-full w-full lg:w-auto hover:bg-blue-100 ">
                        Add Product
                        <Icon icon="mdi:add-bold" width="20" height="20" />
                    </button>
                    <div class="border-s me-5"></div>
                    <button @click="openOrder" class="font-semibold py-2 px-4 rounded-md w-full lg:w-auto" :class="[order ? 'bg-blue-900 text-white' : 'border text-gray-500']">
                        Customer Order
                    </button>
                    <button @click="openModify" class="font-semibold py-2 px-4 rounded-md w-full lg:w-auto" :class="[modify ? 'bg-blue-900 text-white' : 'border text-gray-500']">
                        Modify
                    </button>
                </div>
            </div>
            <div class="min-[1000px]:hidden bg-white rounded-md p-3 flex flex-col gap-2 text-[12px]">
                <button @click="openAddProduct" class="flex justify-center gap-2 border-2 text-blue-900 border-blue-800 font-bold py-1 rounded-full w-full lg:w-auto hover:bg-blue-100 ">
                    Add Product
                    <Icon icon="mdi:add-bold" width="20" height="20" />
                </button>
                <div class="border-t me-5"></div>
                <div class="flex gap-2">
                    <button @click="openOrder" class="font-semibold py-2 px-4 rounded-md w-full lg:w-auto" :class="[order ? 'bg-blue-900 text-white' : 'border text-gray-500']">
                        Customer Order
                    </button>
                    <button @click="openModify" class="font-semibold py-2 px-4 rounded-md w-full lg:w-auto" :class="[modify ? 'bg-blue-900 text-white' : 'border text-gray-500']">
                        Modify
                    </button>
                </div>
            </div>
            <div  class="grid grid-cols-1 lg:grid-cols-5 gap-2">
                <div v-if="loadingProduct" v-for="i in 10" :key="i">
                    <div class="hidden lg:flex flex-col rounded-lg shadow p-3 animate-pulse">
                        <div class="w-full h-[280px] bg-gray-200 rounded-md mb-3"></div>

                        <div class="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div class="h-5 bg-gray-300 rounded w-1/2 mb-2"></div>

                        <div class="flex justify-between mb-3">
                            <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                            <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>

                        <div class="h-10 bg-gray-300 rounded-md"></div>
                    </div>
                    <div class="lg:hidden bg-white rounded-xl shadow-sm overflow-hidden flex animate-pulse">
                        <div class="w-[58%] h-[180px] bg-gray-200"></div>
                        <div class="w-[42%] p-4 flex flex-col justify-between">
                            <div class="flex flex-col gap-2">
                            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div class="h-5 bg-gray-300 rounded w-full"></div>
                            <div class="h-3 bg-gray-300 rounded w-1/3"></div>
                            <div class="h-3 bg-gray-300 rounded w-1/4"></div>
                            </div>
                            <div class="h-7 bg-gray-300 rounded-md w-full"></div>
                        </div>
                    </div>
                </div>
                <div v-else v-for="product in products" class="flex flex-row lg:flex-col bg-white rounded-lg border rounded-lg shadow">
                    <img v-if="product.image" :src="product.image_url" class="w-[200px] lg:w-full lg:h-full object-cover rounded-bl-lg rounded-tl-lg lg:rounded-tr-lg lg:rounded-tl-lg lg:rounded-bl-none">
                    <img v-else-if="product.image == null" src="/emptyproduct.png" class="w-[200px] lg:w-full lg:h-full object-cover rounded-bl-lg rounded-tl-lg lg:rounded-tr-lg lg:rounded-tl-lg lg:rounded-bl-none">
                    <div class="flex flex-col justify-between border-s lg:border-t lg:border-s-0 p-4 w-full">
                        <div>
                            <div class="flex justify-between">
                                <h2 class="text-sm font-semibold">{{ product.name }}</h2>
                            </div>
                            <p class="font-semibold text-lg ">Rp{{ formatNumber(product.price) }}</p>
                            <div class="flex flex-col lg:flex-row justify-between mt-2">
                                <p v-if="product.stock > 0" class="text-[12px]">Available {{ product.stock }}</p>
                                <p v-else-if="product.stock < 1"class="text-[12px]">Stock Unavailable</p>
                                <div v-if="product.product_type == 'Fnb'" class="flex items-center gap-2 text-gray-500">
                                    <p class="text-[12px]">Food & Baverage</p>
                                </div>
                                <div v-else class="flex items-center gap-2 text-gray-500">
                                    <p class="text-[12px]">Sports Gear</p>
                                </div>
                            </div>
                        </div>
                        <button v-if="modify" @click="openModifyProduct(product)" class="text-[12px] font-semibold bg-blue-900 text-white p-2 px-2 mt-3 rounded-md w-full hover:bg-blue-800">
                            <p>Modify Product</p>
                        </button>
                        <div v-if="order" class="flex flex-col lg:flex-row gap-2 font-semibold text-[12px] w-full mt-3">
                            <button v-if="!isInCart(product.id)" @click="selectProduct(product)" class="bg-blue-900 text-white p-2 rounded-md w-full">
                                Add Item
                            </button>
                            <div v-else class="flex items-center justify-between border rounded-md w-full overflow-hidden">
                                <button @click="minQuantity(product)" class="px-3 py-2 bg-gray-200">-</button>
                                <input type="number" :value="getQuantity(product.id)"
                                    @input="inputQuantity(product, Number(($event.target as HTMLInputElement).value))"
                                    class="w-full text-center outline-none"
                                />
                                <button @click="addQuantity(product)" class="px-3 py-2 bg-gray-200">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="cart.length > 0" class="fixed bottom-5 right-7 z-50  border-blue-900 border-2 bg-white shadow-md rounded-xl hidden md:flex flex-col">

        <button v-if="showCartList" @click="closeCartList" class="flex justify-between bg-blue-900 text-white shadow-md items-center p-2 px-4 rounded-tl-md rounded-tr-md">
            <h1 class="text-sm font-bold">Order Cart</h1>
            <Icon icon="iconamoon:arrow-up-2-fill" width="25" height="25" />
        </button>
        <button v-else-if="!showCartList" @click="openCartlist" class="flex justify-between bg-blue-900 text-white shadow-md  items-center p-2 px-4 rounded-md">
            <h1 class="text-sm font-bold">Order Cart</h1>
            <Icon icon="iconamoon:arrow-down-2-fill" width="25" height="25" />
        </button>
        
        <div v-if="showCartList" class="ps-4 pb-4">
            <div class="flex flex-col max-h-[300px] overflow-y-auto pe-4">
                <div class="flex justify-between pb-2 pt-5 font-semibold text-[12px]">
                    <p class="w-[150px]">Product List</p>
                    <p>Quantity</p>
                    <p>Price</p>
                </div>
                <div class="flex flex-col gap-2">
                    <div v-for="item in cart">
                        <div class="flex py-3 text-gray-500">
                            <div class="flex gap-2">
                                <img v-if="item.product.image" :src="item.product.image_url" class="w-[40px] h-[40px] object-cover border rounded-md">
                                <img v-else-if="item.product.image == null" src="/emptyproduct.png" class="w-[40px] h-[40px] object-cover border rounded-md">
                                <div class="flex flex-col w-[190px]">
                                    <p class="text-[12px] w-[150px] truncate">{{ item.product.name }}</p>
                                    <p class="text-[12px]">Rp{{ formatNumber(item.product.price) }}</p>
                                </div>
                            </div>
                            <div class="flex w-[125px] justify-between items-center">
                                <p class="text-[12px]">{{ item.quantity }}</p>
                                <p class="text-[12px] ">Rp{{ formatNumber(item.subtotal) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col pe-4 mt-6">
                <div class="flex flex-col text-[12px]">
                    <p class=" mb-1">Payment Method</p>
                    <select v-model="payment_method" class="p-3  rounded-md border focus:outline-none">
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Qris">Qris</option>
                    </select>
                </div>

                <div class="flex flex-col mt-5 gap-2">
                    <div class="flex justify-between text-[12px] border-dashed border-b pb-1">
                        <p>Total Items</p>
                        <p>{{ cart.length }}</p>
                    </div>
                    <div class="flex justify-between">
                        <p class="font-bold">Total Price</p>
                        <p class="font-bold">Rp{{ formatNumber(totalPrice) }}</p>
                    </div>
                </div>

                <div class="flex mt-7 gap-2">
                    <button @click="cancelTransaction" class="bg-blue-900 p-2 text-[12px] text-white rounded-md font-semibold w-full shadow-sm hover:shadow-lg">Cancel</button>
                    <button @click="createTransaction" class="bg-blue-900 p-2 text-[12px] text-white rounded-md font-semibold w-full shadow-sm hover:shadow-lg">
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
    </div>

    
    <div v-if="cart.length > 0" class="fixed bottom-5 right-7 z-50  border-blue-900 border-2 bg-white shadow-md rounded-xl flex md:hidden flex-col">
        <button @click="openCartlistMobile" class="flex justify-between bg-blue-900 text-white shadow-md  items-center p-2 px-4 rounded-md">
            <h1 class="text-sm font-bold">Order Cart</h1>
            <Icon icon="iconamoon:arrow-down-2-fill" width="25" height="25" />
        </button>
    </div>

    <div v-if="showCartListMobile" class="md:hidden fixed inset-0 z-50">
      <div @click="closeCartList" class="absolute inset-0 bg-black/50"></div>
      <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
          :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
      >
        <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
        <div ref="scrollContainer" class="flex flex-col h-full justify-between gap-2 p-4">
            <div class="flex flex-col">
                <div class="flex justify-between pb-2 font-semibold text-[12px]">
                    <p class="w-[150px]">Product List</p>
                    <p>Quantity</p>
                    <p>Price</p>
                </div>
                <div class="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    <div v-for="item in cart">
                        <div class="flex py-3 text-gray-500">
                            <div class="flex gap-2">
                                <img v-if="item.product.image" :src="item.product.image_url" class="w-[40px] h-[40px] object-cover border rounded-md">
                                <img v-else-if="item.product.image == null" src="/emptyproduct.png" class="w-[40px] h-[40px] object-cover border rounded-md">
                                <div class="flex flex-col w-[190px]">
                                    <p class="text-[12px] w-[150px] truncate">{{ item.product.name }}</p>
                                    <p class="text-[12px]">Rp{{ formatNumber(item.product.price) }}</p>
                                </div>
                            </div>
                            <div class="flex w-[125px] justify-between items-center">
                                <p class="text-[12px]">{{ item.quantity }}</p>
                                <p class="text-[12px] ">Rp{{ formatNumber(item.subtotal) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col mt-6">
                    <div class="flex flex-col text-[12px]">
                        <p class=" mb-1">Payment Method</p>
                        <select v-model="payment_method" class="p-3  rounded-md border focus:outline-none">
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Qris">Qris</option>
                        </select>
                    </div>

                    <div class="flex flex-col mt-5 gap-2">
                        <div class="flex justify-between text-[12px] border-dashed border-b pb-1">
                            <p>Total Items</p>
                            <p>{{ cart.length }}</p>
                        </div>
                        <div class="flex justify-between">
                            <p class="font-bold">Total Price</p>
                            <p class="font-bold">Rp{{ formatNumber(totalPrice) }}</p>
                        </div>
                    </div>

                </div>
            </div>
            <div class="flex mt-7 gap-2">
                <button @click="cancelTransaction" class="bg-blue-900 p-2 text-[12px] text-white rounded-md font-semibold w-full shadow-sm hover:shadow-lg">Cancel</button>
                <button @click="createTransaction" class="bg-blue-900 p-2 text-[12px] text-white rounded-md font-semibold w-full shadow-sm hover:shadow-lg">
                    Confirm Payment
                </button>
            </div>
        </div>
      </div>
    </div>

    <!-- DESKTOP -->
    <div v-if="showAddProduct" class="max-[1000px]:hidden fixed inset-0 z-50 flex items-center justify-center">
        <div @click="closeAddProduct" class="absolute inset-0 bg-black/50"></div>

        <div class="w-[600px] absolute px-5 pb-5 bg-white rounded-md flex flex-col gap-3">
            <div class="flex justify-between border-b pb-3 mb-2 mt-3">
                <h1 class="text-sm font-bold ">Add New product</h1>
                <button @click="closeAddProduct" class="text-gray-500 hover:text-black"><Icon icon="ic:baseline-close" width="20" height="20" /></button>
            </div>

            <div class="flex w-full gap-4">
                <div @click="triggerFileInput" class="w-full h-[320px] object-cover border-dashed border-2 rounded-md flex items-center justify-center cursor-pointer overflow-hidden hover:border-black transition">
                    <span v-if="!imagePreview" class="flex flex-col items-center text-sm text-gray-400">
                        <p>Upload Product Image</p>
                        <p>(optional)</p>
                    </span>
                    <img v-else :src="imagePreview" class="w-full h-full object-cover"/>
                </div>
                <input @change="handleImage" ref="fileInput" type="file" class="hidden" accept="image/*"/>

                <div class="flex flex-col w-full text-[12px]">
                    <div class="flex flex-col gap-2 border-b pb-4 mb-4">
                        <select v-model="newProductInput.product_type" class="border p-3 rounded-md focus:outline-none">
                            <option value="">Select Type</option>
                            <option value="Fnb">Food & Baverage</option>
                            <option value="Gear">Sports Gear</option>
                        </select>
                        <input v-model="newProductInput.name" type="text" placeholder="Product Name" class="border p-3 rounded-md focus:outline-none"/>
                        <input type="text"
                            :value="formattedAmount"
                            @input="onInputAmount"
                            inputmode="numeric"
                            :placeholder="'Price'"
                            class="w-full border p-3 rounded-md focus:outline-none"
                        />
                        <input v-model="newProductInput.stock" type="number" placeholder="Stock" class="border p-3 rounded-md focus:outline-none"/>
                    </div>
                    <button @click="addProduct" class="bg-blue-900 text-white text-sm font-semibold py-2 rounded-md">Add Product</button>
                </div>
            </div>
        </div>
    </div>

    <!-- MOBILE -->
     <div v-if="showAddProduct" class="md:hidden fixed inset-0 z-50">
        <div @click="closeAddProduct" class="absolute inset-0 bg-black/50"></div>
        <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
            :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
        >
            <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto"></div>
            <div ref="scrollContainer" class="flex flex-col h-full justify-between gap-2 p-4 overflow-y-auto">
                <div class="flex flex-col w-full gap-4">
                    <div @click="triggerFileInput" class="w-full h-[300px] object-cover border-dashed border-2 rounded-md flex items-center justify-center cursor-pointer overflow-hidden hover:border-black transition">
                        <span v-if="!imagePreview" class="flex flex-col items-center text-sm text-gray-400">
                            <p>Upload Product Image</p>
                            <p>(optional)</p>
                        </span>
                        <img v-else :src="imagePreview" class="w-full h-full object-cover"/>
                    </div>
                    <input @change="handleImage" ref="fileInput" type="file" class="hidden" accept="image/*"/>

                    <div class="flex flex-col w-full text-[12px]">
                        <div class="flex flex-col gap-2 border-b pb-4 mb-4">
                            <select v-model="newProductInput.product_type" class="border p-3 rounded-md focus:outline-none">
                                <option value="">Select Type</option>
                                <option value="Fnb">Food & Baverage</option>
                                <option value="Gear">Sports Gear</option>
                            </select>
                            <input v-model="newProductInput.name" type="text" placeholder="Product Name" class="border p-3 rounded-md focus:outline-none"/>
                            <input type="text"
                            :value="formattedAmount"
                            @input="onInputAmount"
                            inputmode="numeric"
                            :placeholder="'Price'"
                            class="w-full border p-3 rounded-md focus:outline-none"
                            />
                            <input v-model="newProductInput.stock" type="number" placeholder="Stock" class="border p-3 rounded-md focus:outline-none"/>
                        </div>
                        <button @click="addProduct" class="bg-blue-900 text-white text-sm font-semibold py-2 rounded-md">Add Product</button>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <!-- DESKTOP -->
    <div v-if="modifyProduct" class="hidden fixed inset-0 z-50 md:flex items-center justify-center ">
        <div @click="closeModifyProduct" class="absolute inset-0 bg-black/50"></div>
        <div class="absolute bg-white rounded-md flex flex-col justify-start">
            <div v-if="modifySelection">
                <div class="flex flex-col gap-3">
                    <img v-if="selectedModifyProduct.image" :src="selectedModifyProduct.image_url" class="w-[400px] border-b shadow-sm rounded-tl-lg rounded-tr-lg">
                    <img v-else-if="selectedModifyProduct.image == null" src="/emptyproduct.png" class="w-[400px] border-b shadow-sm rounded-tl-lg rounded-tr-lg">
                    <div class="flex justify-between p-5 items-center">
                        <div class="flex flex-col w-full">
                            <p class="font-semibold text-sm">{{ selectedModifyProduct.name }}</p>
                            <p class="text-lg font-bold">Rp{{ formatNumber(selectedModifyProduct.price) }}</p>
                            <p class="text-sm">Stock: {{ selectedModifyProduct.stock }} PCS</p>
                        </div>
                        <div class="flex flex-col gap-2 w-full font-semibold text-[12px]">
                            <div class="flex gap-2">
                                <button @click="openAddStock" class="flex w-full items-center justify-center bg-blue-900 text-white p-1 px-3 gap-2 rounded-md hover:bg-blue-800">
                                    <p>Edit Stock</p>
                                </button>
                                <button @click="openPricing" class="flex w-full items-center justify-center bg-blue-900 text-white p-1 px-3 gap-2 rounded-md hover:bg-blue-800">
                                    <p>Edit Price</p>
                                </button>
                            </div>
                            <button @click="removeProduct" class="bg-red-900 p-1 text-white rounded-md hover:bg-red-800">
                                <p>Delete Product</p>
                            </button>
                        </div>
                    </div>
                    <button @click="closeModifyProduct" class="text-sm font-semibold opacity-50 bg-gray-100 p-2 border-t hover:opacity-100 hover:text-gray-600">
                        <p>Close</p>
                    </button>
                </div>
            </div>
            <div v-if="showAddStock" class="p-3">
                <button @click="backModify" class="flex items-center gap-1 border-b w-full mb-2 pb-2">
                    <Icon icon="weui:back-filled" width="15" height="15" />
                    <h1 class="font-bold text-sm">Add Product Stock</h1>
                </button>
                <div class="flex gap-4">
                    <img v-if="selectedModifyProduct.image" :src="selectedModifyProduct.image_url" class="w-[200px]">
                    <img v-else-if="selectedModifyProduct.image == null" src="/emptyproduct.png" class="w-[200px]">
                    <div class="flex flex-col justify-between">
                        <div class="flex flex-col">
                            <p class="font-semibold text-sm">{{ selectedModifyProduct.name }}</p>
                            <p class="text-lg font-bold">Rp{{ formatNumber(selectedModifyProduct.price) }}</p>
                            <p class="text-[12px]">Stock: {{ selectedModifyProduct.stock }} PCS</p>
                        </div>
                        <div class="flex flex-col">
                            <p class="text-[12px] text-gray-600">Input Stock</p>
                            <input v-model="addStockBody.stock" type="number" class="border rounded-md focus:outline-none p-2 text-[12px]" placeholder="example: 25">
                            <button @click="addStock" class="text-[12px] font-semibold bg-blue-900 text-white p-2 rounded-md mt-3">Add Stock</button>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="showPricing" class="p-3">
                <button @click="backModify" class="flex items-center gap-1 border-b w-full mb-2 pb-2">
                    <Icon icon="weui:back-filled" width="15" height="15" />
                    <h1 class="font-bold text-sm">Update Product Price</h1>
                </button>
                <div class="flex gap-4">
                    <img v-if="selectedModifyProduct.image" :src="selectedModifyProduct.image_url" class="w-[200px]">
                    <img v-else-if="selectedModifyProduct.image == null" src="/emptyproduct.png" class="w-[200px]">
                    <div class="flex flex-col justify-between">
                        <div class="flex flex-col">
                            <p class="font-semibold text-sm">{{ selectedModifyProduct.name }}</p>
                            <p class="text-lg font-bold">Rp{{ formatNumber(selectedModifyProduct.price) }}</p>
                            <p class="text-[12px]">Stock: {{ selectedModifyProduct.stock }} PCS</p>
                        </div>
                        <div class="flex flex-col">
                            <p class="text-[12px] text-gray-600">Input Price</p>
                            <input type="text"
                            :value="formattedAmount"
                            @input="onInputAmount"
                            inputmode="numeric"
                            :placeholder="'Rp'+ formatNumber(selectedModifyProduct.price)"
                            class="w-full border px-3 py-2 rounded-md mb-2 text-sm text-gray-500 focus:outline-none"
                            />
                            <button @click="changePrice" class="text-[12px] font-semibold bg-blue-900 text-white p-2 rounded-md mt-3">Update Price</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MOBILE -->
    <div v-if="modifyProduct" class="md:hidden fixed inset-0 z-50">
        <div @click="closeModifyProduct" class="absolute inset-0 bg-black/50"></div>
        <div class="absolute bottom-0 left-0 w-full bg-white rounded-t-2xl py-5 transition-transform duration-300 ease-out"
            :style="{ height: '80%', transform: isDragging ? `translateY(${Math.max(0, currentY - startY)}px)` : 'translateY(0)'}"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
        >
            <div class="w-12 h-1.5 bg-gray-300 rounded-full mx-auto"></div>
            <div ref="scrollContainer" class="flex flex-col h-full justify-between gap-2 p-4">
                <div class="flex flex-col h-full justify-between gap-3">
                    <div class="flex flex-col gap-3">
                        <img v-if="selectedModifyProduct.image" :src="selectedModifyProduct.image_url" class="w-[400px] border-b shadow-sm rounded-tl-lg rounded-tr-lg">
                        <img v-else-if="selectedModifyProduct.image == null" src="/emptyproduct.png" class="w-[400px] border-b shadow-sm rounded-tl-lg rounded-tr-lg">
                        <div class="flex justify-between items-start">
                            <div class="flex flex-col">
                                <p class="font-semibold text-sm">{{ selectedModifyProduct.name }}</p>
                                <p class="text-lg font-bold">Rp{{ formatNumber(selectedModifyProduct.price) }}</p>
                            </div>
                            <div class="flex flex-col items-center text-sm">
                                <p class="font-bold">Stock</p>
                                <p>{{ selectedModifyProduct.stock }} pcs</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="modifySelection">
                    <div class="flex flex-col gap-2 w-full font-semibold text-[12px]">
                        <div class="flex gap-2">
                            <button @click="openAddStock" class="flex w-full items-center justify-center bg-blue-900 text-white p-1 px-3 gap-2 rounded-md hover:bg-blue-800">
                                <p>Edit Stock</p>
                            </button>
                            <button @click="openPricing" class="flex w-full items-center justify-center bg-blue-900 text-white p-1 px-3 gap-2 rounded-md hover:bg-blue-800">
                                <p>Edit Price</p>
                            </button>
                        </div>
                        <button @click="removeProduct" class="bg-red-900 p-1 text-white rounded-md hover:bg-red-800">
                            <p>Delete Product</p>
                        </button>
                    </div>
                </div>
                <div v-if="showAddStock">
                    <div class="flex flex-col">
                        <p class="text-[12px] text-gray-600">Input Stock</p>
                        <input v-model="addStockBody.stock" type="number" class="border rounded-md focus:outline-none p-2 text-[12px]" placeholder="example: 25">
                        <div class="flex gap-2 w-full">
                            <button @click="backModify" class="text-[12px] font-semibold bg-red-900 text-white p-2 rounded-md mt-3 w-full">Cancel</button>
                            <button @click="addStock" class="text-[12px] font-semibold bg-blue-900 text-white p-2 rounded-md mt-3 w-full">Add Stock</button>
                        </div>
                    </div>
                </div>
                <div v-if="showPricing">
                    <div class="flex flex-col">
                        <p class="text-[12px] text-gray-600">Input Price</p>
                        <input type="text"
                        :value="formattedAmount"
                        @input="onInputAmount"
                        inputmode="numeric"
                        :placeholder="'Rp'+ formatNumber(selectedModifyProduct.price)"
                        class="w-full border px-3 py-2 rounded-md mb-2 text-sm text-gray-500 focus:outline-none"
                        />
                        <div class="flex gap-2 w-full">
                            <button @click="backModify" class="text-[12px] font-semibold bg-red-900 text-white p-2 rounded-md mt-3 w-full">Cancel</button>
                            <button @click="changePrice" class="text-[12px] font-semibold bg-blue-900 text-white p-2 rounded-md mt-3 w-full">Update Price</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-5"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-5"
    >
        <div v-if="showNotifCreateTransaction && transaction" class="fixed bottom-10 right-7 z-50 w-[400px] py-2 border-blue-900 border-2 px-5 bg-white shadow-md rounded-xl flex flex-col">
            <div class="flex items-center gap-1 text-blue-900 mb-2">
                <Icon icon="lets-icons:check-fill" class="" width="20" height="20" />
                <h1 class="text-sm font-bold ">New Purchase</h1>
            </div>
            <div class="flex items-center gap-2">
                <p>Rp{{ formatNumber(transaction.header.total_price) }}</p>
            </div>
        </div>
        <div v-else-if="showNotifCancelTransaction" class="fixed bottom-5 right-7 z-50 w-[400px] py-2 border-blue-900 border-2 px-5 bg-white shadow-md rounded-xl flex flex-col">
            <div class="flex items-center gap-1 text-blue-900 mb-2">
                <Icon icon="tabler:trash" class="" width="20" height="20" />
                <h1 class="text-sm font-bold ">Cart Items Removed</h1>
            </div>
        </div>
        <div v-else-if="showNotifAddStock && newStock" class="fixed bottom-10 right-7 z-50 w-[400px] py-2 border-blue-900 border-2 px-5 bg-white shadow-md rounded-xl flex flex-col">
            <div class="flex items-center gap-1 text-blue-900 mb-2">
                <Icon icon="lets-icons:check-fill" class="" width="20" height="20" />
                <h1 class="text-sm font-bold ">Stock Updated</h1>
            </div>
            <div class="flex items-center gap-2">
                <img :src="newStock.final.image_url" class="w-[40px]">
                <div class="flex flex-col">
                    <p class="font-semibold text-lg">{{ newStock.final.name }}</p>
                    <div class="flex text-gray-500">
                        <p class="text-sm">Added {{ newStock.added }}</p>
                        <Icon icon="bi:dot" width="16" height="16" />
                        <p class="text-sm">Final Stock {{ newStock.final.stock }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="showNotifPrice && newPrice" class="fixed bottom-10 right-7 z-50 w-[400px] p-2 border-blue-900 border-2 px-5 bg-white shadow-md rounded-xl flex flex-col">
            <div class="flex items-center gap-1 text-blue-900 mb-2">
                <Icon icon="lets-icons:check-fill" class="" width="20" height="20" />
                <h1 class="text-sm font-bold ">Price Updated</h1>
            </div>
            <div class="flex items-center gap-2">
                <img :src="newPrice.image_url" class="w-[40px]">
                <div class="flex flex-col">
                    <p class="font-semibold text-sm">{{ newPrice.name }}</p>
                    <div class="flex text-gray-500">
                        <p class="text-sm">New Price Rp{{ formatNumber(newPrice.price) }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="showNotifDelete && deletedProduct" class="fixed bottom-10 right-7 z-50 w-[400px] p-2 border-blue-900 border-2 px-5 bg-white shadow-md rounded-xl flex flex-col">
            <div class="flex items-center gap-1 text-blue-900 mb-2">
                <Icon icon="lets-icons:check-fill" class="" width="20" height="20" />
                <h1 class="text-sm font-bold ">Product Deleted Successfully</h1>
            </div>
            <div class="flex items-center gap-2">
                <p class="text-sm text-gray-600">Product Deleted:</p>
                <p class="font-semibold text-sm">{{ deletedProduct.name }}</p>
            </div>
        </div>
        <div v-else-if="showNotifNewProduct && newProduct" class="fixed bottom-10 right-7 z-50 w-[400px] p-2 border-blue-900 border-2 px-5 bg-white shadow-md rounded-xl flex flex-col">
            <div class="flex items-center gap-1 text-blue-900 mb-2">
                <Icon icon="lets-icons:check-fill" class="" width="20" height="20" />
                <h1 class="text-sm font-bold ">Product Deleted Successfully</h1>
            </div>
            <div class="flex items-center gap-2">
                <img :src="newProduct.image_url" class="w-[40px]">
                <div class="flex flex-col">
                    <p class="font-semibold text-sm">{{ newProduct.name }}</p>
                    <div class="flex text-gray-500">
                        <p class="text-sm">New Price Rp{{ formatNumber(newProduct.price) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>