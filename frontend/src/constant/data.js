export const menuItems = [
    {
        isHeadr: true,
        title: "menu",
    },

    {
        title: "Dashboard",
        icon: "heroicons-outline:home",
        link: "dashboard",
    },

    {
        title: "Companies",
        icon: "heroicons-outline:office-building",
        link: "companies",
    },

    // seetings
    {
        title: "Settings",
        icon: "heroicons-outline:cog",
        link: "settings",
    },
];

export const colors = {
    primary: "#4669FA",
    secondary: "#A0AEC0",
    danger: "#F1595C",
    black: "#111112",
    warning: "#FA916B",
    info: "#0CE7FA",
    light: "#425466",
    success: "#50C793",
    "gray-f7": "#F7F8FC",
    dark: "#1E293B",
    "dark-gray": "#0F172A",
    gray: "#68768A",
    gray2: "#EEF1F9",
    "dark-light": "#CBD5E1",
};

export const hexToRGB = (hex, alpha) => {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
};

// ecommarce data

import blackTshirt from "@/assets/images/e-commerce/product-card/black-t-shirt.png";
import checkShirt from "@/assets/images/e-commerce/product-card/check-shirt.png";
import blackJumper from "@/assets/images/e-commerce/product-card/classical-black-tshirt.png";
import grayJumper from "@/assets/images/e-commerce/product-card/gray-jumper.png";
import grayTshirt from "@/assets/images/e-commerce/product-card/gray-t-shirt.png";
import pinkBlazer from "@/assets/images/e-commerce/product-card/pink-blazer.png";
import redTshirt from "@/assets/images/e-commerce/product-card/red-t-shirt.png";
import yellowFrok from "@/assets/images/e-commerce/product-card/yellow-frok.png";
import yellowJumper from "@/assets/images/e-commerce/product-card/yellow-jumper.png";

export const products = [
    {
        img: blackJumper,
        category: "men",
        name: "Classical Black T-Shirt Classical Black T-Shirt",
        subtitle: "The best cotton black branded shirt.",
        desc: "The best cotton black branded shirt. The best cotton black branded shirt. The best cotton black branded shirt. The best cotton black branded shirt. The best cotton black branded shirt.",
        rating: "4.8",
        price: 489,
        oldPrice: "$700",
        percent: "40%",
        brand: "apple",
    },
    {
        img: blackTshirt,
        category: "men",
        name: "Classical Black T-Shirt",
        subtitle: "The best cotton black branded shirt.",
        desc: "The best cotton black branded shirt",
        rating: "4.8",
        price: 20,
        oldPrice: "$700",
        percent: "40%",
        brand: "apex",
    },
    {
        img: checkShirt,
        category: "women",
        name: "Classical Black T-Shirt",
        subtitle: "The best cotton black branded shirt.",
        desc: "The best cotton black branded shirt",
        rating: "4.8",
        price: 120,
        oldPrice: "$700",
        percent: "40%",
        brand: "easy",
    },
    {
        img: grayJumper,
        category: "women",
        name: "Classical Black T-Shirt",
        subtitle: "The best cotton black branded shirt.",
        desc: "The best cotton black branded shirt",
        rating: "4.8",
        price: 70,
        oldPrice: "$700",
        percent: "40%",
        brand: "pixel",
    },
    {
        img: grayTshirt,
        category: "baby",
        name: "Classical Black T-Shirt",
        subtitle: "The best cotton black branded shirt.",
        desc: "The best cotton black branded shirt",
        rating: "4.8",
        price: 30,
        oldPrice: "$700",
        percent: "40%",
        brand: "apex",
    },
    {
        img: pinkBlazer,
        category: "women",
        name: "Classical Black T-Shirt",
        subtitle: "The best cotton black branded shirt.",
        desc: "The best cotton black branded shirt",
        rating: "4.8",
        price: 40,
        oldPrice: "$700",
        percent: "40%",
        brand: "apple",
    },
    {
        img: redTshirt,
        category: "women",
        name: "Classical Black T-Shirt",
        subtitle: "The best cotton black branded shirt.",
        desc: "The best cotton black branded shirt",
        rating: "4.8",
        price: 90,
        oldPrice: "$700",
        percent: "40%",
        brand: "easy",
    },
    {
        img: yellowFrok,
        category: "women",
        name: "Classical Black T-Shirt",
        subtitle: "The best cotton black branded shirt.",
        desc: "The best cotton black branded shirt",
        rating: "4.8",
        price: 80,
        oldPrice: "$700",
        percent: "40%",
        brand: "pixel",
    },
    {
        img: yellowJumper,
        category: "furniture",
        name: "Classical Black T-Shirt",
        subtitle: "The best cotton black branded shirt.",
        desc: "The best cotton black branded shirt",
        rating: "4.8",
        price: 20,
        oldPrice: "$700",
        percent: "40%",
        brand: "samsung",
    },
];

export const categories = [
    { label: "All", value: "all", count: "9724" },
    { label: "Men", value: "men", count: "1312" },
    { label: "Women", value: "women", count: "3752" },
    { label: "Child", value: "child", count: "985" },
    { label: "Baby", value: "baby", count: "745" },
    { label: "Footwear", value: "footwear", count: "1280" },
    { label: "Furniture", value: "furniture", count: "820" },
    { label: "Mobile", value: "mobile", count: "2460" },
];

export const brands = [
    { label: "Apple", value: "apple", count: "9724" },
    { label: "Apex", value: "apex", count: "1312" },
    { label: "Easy", value: "easy", count: "3752" },
    { label: "Pixel", value: "pixel", count: "985" },
    { label: "Samsung", value: "samsung", count: "2460" },
];

export const price = [
    {
        label: "$0 - $199",
        value: {
            min: 0,
            max: 199,
        },
        count: "9724",
    },
    {
        label: "$200 - $449",
        value: {
            min: 200,
            max: 499,
        },
        count: "1312",
    },
    {
        label: "$450 - $599",
        value: {
            min: 450,
            max: 599,
        },
        count: "3752",
    },
    {
        label: "$600 - $799",
        value: {
            min: 600,
            max: 799,
        },
        count: "985",
    },
    {
        label: "$800 & Above",
        value: {
            min: 800,
            max: 1000,
        },
        count: "745",
    },
];

export const ratings = [
    { name: 5, value: 5, count: "9724" },
    { name: 4, value: 4, count: "1312" },
    { name: 3, value: 3, count: "3752" },
    { name: 2, value: 2, count: "985" },
    { name: 1, value: 1, count: "2460" },
];

export const selectOptions = [
    {
        value: "option1",
        label: "Option 1",
    },
    {
        value: "option2",
        label: "Option 2",
    },
    {
        value: "option3",
        label: "Option 3",
    },
];
export const selectCategory = [
    {
        value: "option1",
        label: "Top Rated",
    },
    {
        value: "option2",
        label: "Option 2",
    },
    {
        value: "option3",
        label: "Option 3",
    },
];

import bkash from "@/assets/images/e-commerce/cart-icon/bkash.png";
import fatoorah from "@/assets/images/e-commerce/cart-icon/fatoorah.png";
import instamojo from "@/assets/images/e-commerce/cart-icon/instamojo.png";
import iyzco from "@/assets/images/e-commerce/cart-icon/iyzco.png";
import nagad from "@/assets/images/e-commerce/cart-icon/nagad.png";
import ngenious from "@/assets/images/e-commerce/cart-icon/ngenious.png";
import payfast from "@/assets/images/e-commerce/cart-icon/payfast.png";
import payku from "@/assets/images/e-commerce/cart-icon/payku.png";
import paypal from "@/assets/images/e-commerce/cart-icon/paypal.png";
import paytm from "@/assets/images/e-commerce/cart-icon/paytm.png";
import razorpay from "@/assets/images/e-commerce/cart-icon/razorpay.png";
import ssl from "@/assets/images/e-commerce/cart-icon/ssl.png";
import stripe from "@/assets/images/e-commerce/cart-icon/stripe.png";
import truck from "@/assets/images/e-commerce/cart-icon/truck.png";
import vougepay from "@/assets/images/e-commerce/cart-icon/vougepay.png";

export const payments = [
    {
        img: bkash,
        value: "bkash",
    },
    {
        img: fatoorah,
        value: "fatoorah",
    },
    {
        img: instamojo,
        value: "instamojo",
    },
    {
        img: iyzco,
        value: "iyzco",
    },
    {
        img: nagad,
        value: "nagad",
    },
    {
        img: ngenious,
        value: "ngenious",
    },

    {
        img: payfast,
        value: "payfast",
    },
    {
        img: payku,
        value: "payku",
    },
    {
        img: paypal,
        value: "paypal",
    },
    {
        img: paytm,
        value: "paytm",
    },
    {
        img: razorpay,
        value: "razorpay",
    },
    {
        img: ssl,
        value: "ssl",
    },
    {
        img: stripe,
        value: "stripe",
    },
    {
        img: truck,
        value: "truck",
    },
    {
        img: vougepay,
        value: "vougepay",
    },
];
