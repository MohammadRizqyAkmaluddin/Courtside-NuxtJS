<template>
    <footer class=" py-10 mt-[50px] font-inter border-t">
        <div class="px-[40px] sm:px-[40px] lg:px-[100px] flex flex-col items-center lg:flex-row lg:justify-between gap-10">
            <div class="flex flex-col items-center lg:items-start gap-2">
                <NuxtLink href="/"><img src="/logo.png" class="w-[150px]"></NuxtLink>
                <p class="text-[12px] text-gray-300">© 2026 Courthub Sports Center All Right Reserved</p>
            </div>
            <div class="flex flex-col lg:flex-row justify-center gap-6 lg:gap-20">
                <div class="flex flex-col items-center gap-5">
                    <h2 class="text-md font-bold">Content</h2>
                    <div class="flex flex-col items-center gap-2">
                        <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Explore Venue</NuxtLink>
                        <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Find Sparring</NuxtLink>
                        <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Courtside Cup</NuxtLink>
                    </div>
                </div>
                <div class="flex flex-col gap-5 items-center">
                    <h2 class="text-md font-bold">Company</h2>
                    <div class="flex flex-col gap-2 items-center">
                        <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">About Courtside</NuxtLink>
                        <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Privacy & Policy</NuxtLink>
                        <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Term & Conditions</NuxtLink>
                    </div>
                </div>
                <div class="flex flex-col gap-5 items-center">
                    <h2 class="text-md font-bold">Support</h2>
                    <div class="flex flex-col gap-2 items-center">
                        <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Contact Us</NuxtLink>
                        <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Sponsorship</NuxtLink>
                    </div>
                </div>
            </div>
            <DownloadColored />
        </div>
    </footer>
</template>