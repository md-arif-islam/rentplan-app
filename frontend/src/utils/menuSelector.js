import * as adminMenuData from "@/constant/data";
import * as companyMenuData from "@/constant/data-company";

/**
 * Returns menu data based on user role
 * @param {string} role - The user role (super_admin, company_admin, etc.)
 * @returns {Object} The appropriate menu data
 */
export const getMenuData = (role) => {
    if (role === "super_admin") {
        return adminMenuData;
    } else if (role === "company_admin") {
        return companyMenuData;
    }
    // Default to company menu if role is undefined or not recognized
    return companyMenuData;
};

/**
 * Returns menu items based on user role
 * @param {string} role - The user role (super_admin, company_admin, etc.)
 * @returns {Array} The appropriate menu items
 */
export const getMenuItems = (role) => {
    return getMenuData(role).menuItems;
};

/**
 * Returns colors based on user role
 * @param {string} role - The user role
 * @returns {Object} Color configuration
 */
export const getColors = (role) => {
    return getMenuData(role).colors;
};
