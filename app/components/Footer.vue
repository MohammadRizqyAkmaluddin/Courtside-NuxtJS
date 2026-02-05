<template>
    <footer class="px-10 py-10 mt-[100px] font-inter border-t">
            <div class="flex flex-col items-center lg:flex-row lg:justify-between gap-10">
                <div class="flex flex-col items-center lg:items-start gap-2">
                    <NuxtLink href="/"><img src="/logo.png" class="w-[150px]"></NuxtLink>
                    <p class="text-sm text-gray-300">© 2026 Courthub Sports Center All Right Reserved</p>
                </div>
                <div class="flex gap-20">
                    <div class="flex flex-col gap-5">
                        <h2 class="text-md font-bold">Content</h2>
                        <div class="flex flex-col gap-2">
                            <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Explore Venue</NuxtLink>
                            <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Find Sparring</NuxtLink>
                            <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Courtside Cup</NuxtLink>
                        </div>
                    </div>
                    <div class="flex flex-col gap-5">
                        <h2 class="text-md font-bold">Company</h2>
                        <div class="flex flex-col gap-2">
                            <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">About Courtside</NuxtLink>
                            <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Privacy & Policy</NuxtLink>
                            <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Term & Conditions</NuxtLink>
                        </div>
                    </div>
                    <div class="flex flex-col gap-5">
                        <h2 class="text-md font-bold">Support</h2>
                        <div class="flex flex-col gap-2">
                            <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Contact Us</NuxtLink>
                            <NuxtLink href="/court" class="text-sm text-gray-600 hover:text-black">Sponsorship</NuxtLink>
                        </div>
                    </div>
                </div>
                <DownloadColored />
            </div>
    </footer>
</template>