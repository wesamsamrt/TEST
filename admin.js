const loginPage = document.getElementById("loginPage");
const adminPage = document.getElementById("adminPage");

const adminCode = document.getElementById("adminCode");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

const logoutButton = document.getElementById("logoutButton");


/* =========================
   إظهار لوحة الإدارة
========================= */

function showAdmin() {

    loginPage.style.display = "none";
    adminPage.style.display = "block";

}


/* =========================
   إظهار تسجيل الدخول
========================= */

function showLogin() {

    loginPage.style.display = "flex";
    adminPage.style.display = "none";

}


/* =========================
   التحقق هل المستخدم أدمن
========================= */

async function isAdmin() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (!session || !session.user) {

        return false;

    }


    const {
        data,
        error
    } = await supabaseClient
        .from("admins")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();


    if (error) {

        console.error(
            "Admin Check Error:",
            error
        );

        return false;

    }


    return !!data;

}


/* =========================
   تسجيل الدخول للإدارة
========================= */

async function login() {

    const password =
        adminCode.value.trim();


    if (!password) {

        loginMessage.textContent =
            "اكتب كلمة المرور";

        loginMessage.style.color =
            "#e05265";

        return;

    }


    loginButton.disabled = true;

    loginButton.textContent =
        "جاري التحقق...";


    const email =
        "procurement@wesamsa.com";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            console.error(error);

            loginMessage.textContent =
                "رمز الدخول غير صحيح";

            loginMessage.style.color =
                "#e05265";

            loginButton.disabled =
                false;

            loginButton.textContent =
                "دخول";

            return;

        }


        /* =========================
           التحقق من صلاحية الأدمن
        ========================= */

        const admin =
            await isAdmin();


        if (!admin) {

            await supabaseClient.auth.signOut();


            loginMessage.textContent =
                "هذا الحساب ليس لديه صلاحية دخول لوحة الإدارة";

            loginMessage.style.color =
                "#e05265";

            loginButton.disabled =
                false;

            loginButton.textContent =
                "دخول";

            return;

        }


        /* =========================
           نجاح
        ========================= */

        loginMessage.textContent =
            "تم الدخول بنجاح ✓";

        loginMessage.style.color =
            "#2e9d69";


        showAdmin();


        loginButton.disabled =
            false;

        loginButton.textContent =
            "دخول";

    }

    catch (error) {

        console.error(
            "Admin Login Error:",
            error
        );


        loginMessage.textContent =
            "حدث خطأ أثناء تسجيل الدخول";

        loginMessage.style.color =
            "#e05265";


        loginButton.disabled =
            false;

        loginButton.textContent =
            "دخول";

    }

}


/* =========================
   تسجيل الخروج
========================= */

async function logout() {

    await supabaseClient.auth.signOut();

    showLogin();

    adminCode.value = "";

}


/* =========================
   زر الدخول
========================= */

loginButton.addEventListener(
    "click",
    login
);


/* =========================
   Enter
========================= */

adminCode.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            login();

        }

    }
);


/* =========================
   زر الخروج
========================= */

logoutButton.addEventListener(
    "click",
    logout
);


/* =========================
   التحقق عند فتح الصفحة
========================= */
/* =========================
   حساب الإدارة المسموح
========================= */

const ADMIN_EMAIL = "zzzzxxccvvbbnnmm12345a@wesamsa.com";


/* =========================
   التحقق من حساب الإدارة
========================= */

async function checkSession() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    /* لا يوجد تسجيل دخول */

    if (!session || !session.user) {

        showLogin();

        return;

    }


    /* إيميل المستخدم */

    const userEmail =
        (session.user.email || "")
            .trim()
            .toLowerCase();


    /* =========================
       التحقق من أنه الأدمن
    ========================= */

    if (userEmail !== ADMIN_EMAIL.toLowerCase()) {

        console.log(
            "محاولة دخول غير مصرح بها:",
            userEmail
        );


        /* تسجيل خروج الحساب */

        await supabaseClient.auth.signOut();


        showLogin();


        loginMessage.textContent =
            "هذا الحساب ليس لديه صلاحية دخول لوحة الإدارة";

        loginMessage.style.color =
            "#e05265";


        return;

    }


    /* =========================
       الحساب صحيح
    ========================= */

    showAdmin();

}


checkSession();



/* =========================================================
   إدارة المنتجات
========================================================= */

const productsButton =
    document.getElementById("productsButton");

const productsAdmin =
    document.getElementById("productsAdmin");

const backToDashboard =
    document.getElementById("backToDashboard");

const dashboardContent =
    document.querySelector(".admin-content");

const adminProducts =
    document.getElementById("adminProducts");

const adminProductSearch =
    document.getElementById("adminProductSearch");


let adminProductsData = [];
let selectedProductImage = null;

const productImage =
    document.getElementById("productImage");

productImage.addEventListener("change", function () {

    selectedProductImage =
        this.files[0] || null;

});

/* فتح إدارة المنتجات */

productsButton.addEventListener("click", async function () {

    dashboardContent.style.display = "none";

    productsAdmin.style.display = "block";

    await loadAdminProducts();

});


/* الرجوع */

backToDashboard.addEventListener("click", function () {

    productsAdmin.style.display = "none";

    dashboardContent.style.display = "block";

});


/* تحميل المنتجات */

async function loadAdminProducts() {

    adminProducts.innerHTML = `
        <div class="loading">
            جاري تحميل المنتجات...
        </div>
    `;


    const { data, error } =
        await supabaseClient
            .from("products")
            .select("*")
            .order("id", { ascending: false });


    if (error) {

        console.error(error);

        adminProducts.innerHTML = `
            <div class="message error">
                ${error.message}
            </div>
        `;

        return;
    }


    adminProductsData = data || [];

    renderAdminProducts(adminProductsData);

}


/* عرض المنتجات */

function renderAdminProducts(products) {

    adminProducts.innerHTML = "";


    if (!products.length) {

        adminProducts.innerHTML = `
            <div class="message">
                لا توجد منتجات
            </div>
        `;

        return;
    }


    products.forEach(product => {

        const item =
            document.createElement("div");

        item.className =
            "admin-product";


        item.innerHTML = `

            <div class="admin-product-info">

                <h3>
                    ${product.model || "بدون موديل"}
                </h3>

                <p>
                    ${product.category || ""}
                    •
                    ${product.product_type || ""}
                    •
                    ${product.type || ""}
                    •
                    ${product.company || ""}
                </p>

            </div>


            <div class="admin-product-quantity">
                الكمية: ${product.quantity ?? 0}
            </div>


            <div class="admin-product-price">
                ${product.price ?? 0} ر.س
            </div>


            <div class="admin-product-actions">

                <button
                    class="edit-product"
                    onclick="editProduct(${product.id})"
                >
                    ✏️
                </button>

                <button
                    class="delete-product"
                    onclick="deleteProduct(${product.id})"
                >
                    🗑️
                </button>

            </div>
        `;


        adminProducts.appendChild(item);

    });

}


/* البحث */

adminProductSearch.addEventListener(
    "input",
    function () {

        const search =
            this.value
                .toLowerCase()
                .trim();


        const filtered =
            adminProductsData.filter(product => {

                const text = `

                    ${product.model || ""}
                    ${product.company || ""}
                    ${product.category || ""}
                    ${product.product_type || ""}
                    ${product.type || ""}

                `.toLowerCase();


                return text.includes(search);

            });


        renderAdminProducts(filtered);

    }
);




/* =========================
   إضافة / تعديل منتج
========================= */

const addProductButton =
    document.getElementById("addProductButton");

const productFormCard =
    document.getElementById("productFormCard");

const cancelProductButton =
    document.getElementById("cancelProductButton");

const saveProductButton =
    document.getElementById("saveProductButton");

const productFormMessage =
    document.getElementById("productFormMessage");


addProductButton.addEventListener("click", function () {

    productFormCard.style.display = "block";

    productFormMessage.textContent = "";

    productFormCard.scrollIntoView({
        behavior: "smooth"
    });

});


cancelProductButton.addEventListener("click", function () {

    productFormCard.style.display = "none";

    clearProductForm();

});


function clearProductForm() {

    document.getElementById("productCategory").value = "";
    document.getElementById("productProductType").value = "";
    document.getElementById("productType").value = "";
    document.getElementById("productCompany").value = "";
    document.getElementById("productModel").value = "";
    document.getElementById("productColor").value = "";
    document.getElementById("productQuantity").value = "";
    document.getElementById("productPrice").value = "";


    selectedProductImage = null;

document.getElementById("productImage").value = "";

document.getElementById("productImagePreview").innerHTML = "";
}

/* =========================================================
   رفع صورة المنتج
========================================================= */
async function uploadProductImage(productId, file) {

    if (!productId) {
        console.error("لا يوجد productId");
        return null;
    }

    if (!file) {
        console.error("لم يتم اختيار صورة");
        return null;
    }

    try {

        /* =========================
           اسم فريد للصورة
        ========================= */

        const fileExt =
            file.name.split(".").pop();

        const fileName =
            `${crypto.randomUUID()}.${fileExt}`;

        const filePath =
            `products/${fileName}`;


        /* =========================
           رفع الصورة إلى Storage
        ========================= */

        const {
            error: uploadError
        } = await supabaseClient
            .storage
            .from("product-images")
            .upload(
                filePath,
                file,
                {
                    upsert: false,
                    contentType: file.type
                }
            );


        if (uploadError) {

            console.error(
                "Image Upload Error:",
                uploadError
            );

            alert(
                "حدث خطأ أثناء رفع الصورة:\n" +
                uploadError.message
            );

            return null;
        }


        /* =========================
           الحصول على رابط الصورة
        ========================= */

        const {
            data: publicData
        } =
            supabaseClient
                .storage
                .from("product-images")
                .getPublicUrl(filePath);


        const imageUrl =
            publicData?.publicUrl;


        if (!imageUrl) {

            console.error(
                "لم يتم الحصول على رابط الصورة"
            );

            return null;
        }


        console.log(
            "رابط الصورة:",
            imageUrl
        );


        /* =========================
           حفظ الرابط في نفس المنتج
        ========================= */

        const {
            error: updateError
        } =
            await supabaseClient
                .from("products")
                .update({
                    image: imageUrl
                })
                .eq("id", productId);


        if (updateError) {

            console.error(
                "Product Image Update Error:",
                updateError
            );

            alert(
                "تم رفع الصورة، لكن لم يتم حفظها داخل المنتج:\n" +
                updateError.message
            );

            return null;
        }


        console.log(
            "تم حفظ الصورة داخل المنتج ✅"
        );


        return imageUrl;

    }

    catch (error) {

        console.error(
            "Upload Product Image Error:",
            error
        );

        alert(
            "حدث خطأ أثناء رفع الصورة"
        );

        return null;
    }

}


/* حفظ المنتج */

saveProductButton.addEventListener(
    "click",
    saveNewProduct
);


async function saveNewProduct() {

    const category =
        document.getElementById("productCategory").value.trim();

    const productType =
        document.getElementById("productProductType").value.trim();

    const type =
        document.getElementById("productType").value.trim();

    const company =
        document.getElementById("productCompany").value.trim();

    const model =
        document.getElementById("productModel").value.trim();

    const color =
        document.getElementById("productColor").value.trim();

    const quantity =
        Number(
            document.getElementById("productQuantity").value
        );

    const price =
        Number(
            document.getElementById("productPrice").value
        );

    const imageFile =
        document.getElementById("productImage").files[0];


    if (
        !category ||
        !productType ||
        !type ||
        !company ||
        !model
    ) {

        productFormMessage.textContent =
            "فضلاً أكمل بيانات المنتج المطلوبة";

        productFormMessage.style.color =
            "#e05265";

        return;
    }


    saveProductButton.disabled = true;

    saveProductButton.textContent =
        editingProductId
            ? "جاري تعديل المنتج..."
            : "جاري الحفظ...";



            let imageUrl = null;

try {

    if (imageFile) {

        imageUrl =
            await uploadProductImage(imageFile);

    }

}
catch (error) {

    productFormMessage.textContent =
        "حدث خطأ أثناء رفع صورة المنتج";

    productFormMessage.style.color =
        "#e05265";

    saveProductButton.disabled = false;

    saveProductButton.textContent =
        editingProductId
            ? "حفظ التعديل"
            : "حفظ المنتج";

    return;
}

    let result;


    if (editingProductId) {

        result =
            await supabaseClient
                .from("products")
                .update({

                    category: category,

                    product_type: productType,

                    type: type,

                    company: company,

                    model: model,

                    color: color,

                    quantity: quantity || 0,

                    price: price || 0

                })
                .eq("id", editingProductId)
                .select()
                .single();

    }

    else {

        result =
            await supabaseClient
                .from("products")
                .insert({

                      category: category,

                    product_type: productType,

                      type: type,

                 company: company,

              model: model,

                  color: color,

                 quantity: quantity || 0,

                  price: price || 0,

                 image: imageUrl

                    })
                .select()
                .single();

    }


    if (result.error) {

        console.error(result.error);

        productFormMessage.textContent =
            result.error.message;

        productFormMessage.style.color =
            "#e05265";

        saveProductButton.disabled = false;

        saveProductButton.textContent =
            editingProductId
                ? "حفظ التعديل"
                : "حفظ المنتج";

        return;
    }
/* =========================
   رفع صورة المنتج
========================= */

if (selectedProductImage) {

    await uploadProductImage(
        result.data.id,
        selectedProductImage
    );

}

    productFormMessage.textContent =
        editingProductId
            ? "تم تعديل المنتج بنجاح ✅"
            : "تمت إضافة المنتج بنجاح ✅";

    productFormMessage.style.color =
        "#2e9d69";


    editingProductId = null;

    clearProductForm();

    await loadAdminProducts();


    saveProductButton.disabled = false;

    saveProductButton.textContent =
        "حفظ المنتج";

}


let editingProductId = null;


/* تعديل المنتج */

async function editProduct(id) {

    const product =
        adminProductsData.find(
            item => item.id === id
        );


    if (!product) {

        alert("لم يتم العثور على المنتج");

        return;
    }


    editingProductId = id;


    document.getElementById("productCategory").value =
        product.category || "";

    document.getElementById("productProductType").value =
        product.product_type || "";

    document.getElementById("productType").value =
        product.type || "";

    document.getElementById("productCompany").value =
        product.company || "";

    document.getElementById("productModel").value =
        product.model || "";

    document.getElementById("productColor").value =
        product.color || "";

    document.getElementById("productQuantity").value =
        product.quantity ?? 0;

    document.getElementById("productPrice").value =
        product.price ?? 0;


    productFormCard.style.display =
        "block";


    productFormCard.scrollIntoView({
        behavior: "smooth"
    });


    saveProductButton.textContent =
        "حفظ التعديل";


    productFormMessage.textContent =
        "";


    const preview =
        document.getElementById(
            "productImagePreview"
        );


    if (product.image) {

        preview.innerHTML = `

            <div
                style="
                    margin-top:10px;
                    display:flex;
                    align-items:center;
                    gap:10px;
                "
            >

                <img
                    src="${product.image}"
                    style="
                        width:80px;
                        height:80px;
                        object-fit:cover;
                        border-radius:10px;
                    "
                >

                <span>
                    الصورة الحالية
                </span>

            </div>

        `;

    }

    else {

        preview.innerHTML =
            "";

    }

}


/* حذف المنتج */

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذا المنتج؟"
        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء حذف المنتج:\n" +
            error.message
        );

        return;

    }


    await loadAdminProducts();

}



/* =========================================================
   إدارة التصنيفات
========================================================= */

const categoriesButton =
    document.getElementById(
        "categoriesButton"
    );

const categoriesAdmin =
    document.getElementById(
        "categoriesAdmin"
    );

const backFromCategories =
    document.getElementById(
        "backFromCategories"
    );

const addCategoryButton =
    document.getElementById(
        "addCategoryButton"
    );

const categoryFormCard =
    document.getElementById(
        "categoryFormCard"
    );

const cancelCategoryButton =
    document.getElementById(
        "cancelCategoryButton"
    );

const saveCategoryButton =
    document.getElementById(
        "saveCategoryButton"
    );

const categoryFormMessage =
    document.getElementById(
        "categoryFormMessage"
    );

const categoriesList =
    document.getElementById(
        "categoriesList"
    );


let editingCategoryId = null;


/* =========================================================
   فتح إدارة التصنيفات
========================================================= */

categoriesButton.addEventListener(
    "click",
    async function () {

        dashboardContent.style.display =
            "none";

        productsAdmin.style.display =
            "none";

        categoriesAdmin.style.display =
            "block";

        await loadCategories();

    }
);


/* =========================================================
   الرجوع للوحة
========================================================= */

backFromCategories.addEventListener(
    "click",
    function () {

        categoriesAdmin.style.display =
            "none";

        dashboardContent.style.display =
            "block";

    }
);


/* =========================================================
   زر إضافة تصنيف
========================================================= */

addCategoryButton.addEventListener(
    "click",
    function () {

        editingCategoryId = null;

        categoryFormCard.style.display =
            "block";

        categoryFormMessage.textContent =
            "";

        document.getElementById(
            "categoryName"
        ).value = "";

        document.getElementById(
            "categoryIcon"
        ).value = "";

        saveCategoryButton.textContent =
            "حفظ التصنيف";

    }
);


/* =========================================================
   إلغاء التصنيف
========================================================= */

cancelCategoryButton.addEventListener(
    "click",
    function () {

        categoryFormCard.style.display =
            "none";

        editingCategoryId = null;

    }
);


/* =========================================================
   تحميل التصنيفات
========================================================= */

async function loadCategories() {

    categoriesList.innerHTML = `
        <div class="loading">
            جاري تحميل التصنيفات...
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("categories")
            .select("*")
            .order("id", {
                ascending: false
            });


    if (error) {

        console.error(error);

        categoriesList.innerHTML = `
            <div class="message error">
                ${error.message}
            </div>
        `;

        return;

    }


    renderCategories(
        data || []
    );

}


/* =========================================================
   عرض التصنيفات
========================================================= */

function renderCategories(
    categories
) {

    categoriesList.innerHTML =
        "";


    if (!categories.length) {

        categoriesList.innerHTML = `
            <div class="message">
                لا توجد تصنيفات
            </div>
        `;

        return;

    }


    categories.forEach(
        category => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "category-item";


            item.innerHTML = `

                <div
                    class="category-info"
                >

                    <div
                        class="category-icon"
                    >
                        ${
                            category.icon ||
                            "📦"
                        }
                    </div>

                    <div>

                        <h3>
                            ${
                                category.name ||
                                ""
                            }
                        </h3>

                    </div>

                </div>


                <div
                    class="category-actions"
                >

                    <button
                        class="edit-category"
                        onclick="editCategory(${category.id})"
                    >
                        ✏️
                    </button>

                    <button
                        class="delete-category"
                        onclick="deleteCategory(${category.id})"
                    >
                        🗑️
                    </button>

                </div>

            `;


            categoriesList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   حفظ التصنيف
========================================================= */

saveCategoryButton.addEventListener(
    "click",
    saveCategory
);


async function saveCategory() {

    const name =
        document.getElementById(
            "categoryName"
        )
        .value
        .trim();


    const icon =
        document.getElementById(
            "categoryIcon"
        )
        .value
        .trim();


    if (!name) {

        categoryFormMessage.textContent =
            "اكتب اسم التصنيف";

        categoryFormMessage.style.color =
            "#e05265";

        return;

    }


    saveCategoryButton.disabled =
        true;


    saveCategoryButton.textContent =
        editingCategoryId
            ? "جاري التعديل..."
            : "جاري الحفظ...";


    let result;


    if (editingCategoryId) {

        result =
            await supabaseClient
                .from("categories")
                .update({

                    name: name,

                    icon: icon

                })
                .eq(
                    "id",
                    editingCategoryId
                );

    }

    else {

        result =
            await supabaseClient
                .from("categories")
                .insert({

                    name: name,

                    icon: icon

                });

    }


    if (result.error) {

        console.error(
            result.error
        );

        categoryFormMessage.textContent =
            result.error.message;

        categoryFormMessage.style.color =
            "#e05265";

        saveCategoryButton.disabled =
            false;

        saveCategoryButton.textContent =
            editingCategoryId
                ? "حفظ التعديل"
                : "حفظ التصنيف";

        return;

    }


    categoryFormMessage.textContent =
        editingCategoryId
            ? "تم تعديل التصنيف بنجاح ✅"
            : "تمت إضافة التصنيف بنجاح ✅";

    categoryFormMessage.style.color =
        "#2e9d69";


    editingCategoryId =
        null;


    document.getElementById(
        "categoryName"
    ).value = "";

    document.getElementById(
        "categoryIcon"
    ).value = "";


    categoryFormCard.style.display =
        "none";


    saveCategoryButton.disabled =
        false;

    saveCategoryButton.textContent =
        "حفظ التصنيف";


    await loadCategories();

}


/* =========================================================
   تعديل التصنيف
========================================================= */

async function editCategory(id) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("categories")
            .select("*")
            .eq("id", id)
            .single();


    if (error) {

        console.error(error);

        alert(
            "لم يتم العثور على التصنيف"
        );

        return;

    }


    editingCategoryId =
        id;


    document.getElementById(
        "categoryName"
    ).value =
        data.name || "";


    document.getElementById(
        "categoryIcon"
    ).value =
        data.icon || "";


    categoryFormCard.style.display =
        "block";


    saveCategoryButton.textContent =
        "حفظ التعديل";


    categoryFormMessage.textContent =
        "";

}


/* =========================================================
   حذف التصنيف
========================================================= */

async function deleteCategory(id) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذا التصنيف؟"
        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("categories")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء حذف التصنيف:\n" +
            error.message
        );

        return;

    }


    await loadCategories();

}


/* =========================================================
   إدارة الطلبات
========================================================= */

const ordersButton =
    document.getElementById(
        "ordersButton"
    );

const ordersAdmin =
    document.getElementById(
        "ordersAdmin"
    );

const backFromOrders =
    document.getElementById(
        "backFromOrders"
    );

const adminOrders =
    document.getElementById(
        "adminOrders"
    );


/* =========================================================
   فتح إدارة الطلبات
========================================================= */

ordersButton.addEventListener(
    "click",
    async function () {

        dashboardContent.style.display =
            "none";

        productsAdmin.style.display =
            "none";

        categoriesAdmin.style.display =
            "none";

        ordersAdmin.style.display =
            "block";

        await loadAdminOrders();

    }
);


/* =========================================================
   الرجوع
========================================================= */

backFromOrders.addEventListener(
    "click",
    function () {

        ordersAdmin.style.display =
            "none";

        dashboardContent.style.display =
            "block";

    }
);


/* =========================================================
   تحميل الطلبات
========================================================= */

async function loadAdminOrders() {

    adminOrders.innerHTML = `
        <div class="loading">
            جاري تحميل الطلبات...
        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("orders")
                .select(`
                    *,
                    order_items (
                        id,
                        order_id,
                        product_id,
                        product_code,
                        category,
                        product_type,
                        type,
                        company,
                        model,
                        color,
                        quantity,
                        price,
                        image
                    )
                `)
                .order(
                    "id",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Orders Error:",
                error
            );

            adminOrders.innerHTML = `
                <div class="message error">
                    ${
                        error.message
                    }
                </div>
            `;

            return;

        }


        renderAdminOrders(
            data || []
        );

    }

    catch (error) {

        console.error(
            "Load Orders Error:",
            error
        );

        adminOrders.innerHTML = `
            <div class="message error">
                حدث خطأ أثناء تحميل الطلبات
            </div>
        `;

    }

}


/* =========================================================
   عرض الطلبات
========================================================= */

function renderAdminOrders(
    orders
) {

    adminOrders.innerHTML =
        "";


    if (!orders.length) {

        adminOrders.innerHTML = `
            <div class="message">
                لا توجد طلبات
            </div>
        `;

        return;

    }


    orders.forEach(
        order => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "admin-order";


            const orderItems =
                order.order_items ||
                [];


            let itemsHtml =
                "";


            orderItems.forEach(
                product => {

                    itemsHtml += `

                        <div
                            class="admin-order-item"
                        >

                            <div
                                class="admin-order-item-image"
                            >

                                ${
                                    product.image
                                    ?
                                    `
                                        <img
                                            src="${escapeHtmlAttribute(product.image)}"
                                            alt=""
                                        >
                                    `
                                    :
                                    "📦"
                                }

                            </div>


                            <div
                                class="admin-order-item-info"
                            >

                                <strong>
                                    ${
                                        escapeHtmlAttribute(
                                            product.model ||
                                            "بدون موديل"
                                        )
                                    }
                                </strong>

                                <span>
                                    ${
                                        escapeHtmlAttribute(
                                            product.company ||
                                            ""
                                        )
                                    }
                                </span>

                                <span>
                                    الكمية:
                                    ${
                                        product.quantity ??
                                        0
                                    }
                                </span>

                            </div>


                            <div
                                class="admin-order-item-price"
                            >
                                ${
                                    Number(
                                        product.price ||
                                        0
                                    ).toFixed(2)
                                }
                                ر.س
                            </div>

                        </div>

                    `;

                }
            );


            item.innerHTML = `

                <div
                    class="admin-order-header"
                >

                    <div>

                        <h3>
                            الطلب #
                            ${
                                order.id
                            }
                        </h3>

                        <span>
                            ${
                                order.created_at
                                ?
                                new Date(
                                    order.created_at
                                ).toLocaleString(
                                    "ar-SA"
                                )
                                :
                                ""
                            }
                        </span>

                    </div>


                    <div
                        class="admin-order-status"
                    >
                        ${
                            escapeHtmlAttribute(
                                order.status ||
                                "جديد"
                            )
                        }
                    </div>

                </div>


                <div
                    class="admin-order-customer"
                >

                    <div>

                        <strong>
                            العميل
                        </strong>

                        <span>
                            ${
                                escapeHtmlAttribute(
                                    order.customer_name ||
                                    ""
                                )
                            }
                        </span>

                    </div>


                    <div>

                        <strong>
                            الجوال
                        </strong>

                        <span>
                            ${
                                escapeHtmlAttribute(
                                    order.customer_phone ||
                                    ""
                                )
                            }
                        </span>

                    </div>

                </div>


                <div
                    class="admin-order-items"
                >

                    ${
                        itemsHtml ||
                        `
                            <div class="message">
                                لا توجد منتجات
                            </div>
                        `
                    }

                </div>


                <div
                    class="admin-order-footer"
                >

                    <div>

                        <strong>
                            الإجمالي
                        </strong>

                        <span>
                            ${
                                Number(
                                    order.total ||
                                    0
                                ).toFixed(2)
                            }
                            ر.س
                        </span>

                    </div>


                    <div
                        class="admin-order-actions"
                    >

                        <button
                            type="button"
                            class="edit-order-button"
                            onclick="openEditOrder(${order.id})"
                        >
                            ✏️ تعديل
                        </button>

                        <button
                            type="button"
                            class="delete-order-button"
                            onclick="deleteOrder(${order.id})"
                        >
                            🗑️ حذف
                        </button>

                    </div>

                </div>

            `;


            adminOrders.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   حذف الطلب
========================================================= */

async function deleteOrder(id) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذا الطلب؟"
        );


    if (!confirmed) {

        return;

    }


    try {

        const {
            error: itemsError
        } =
            await supabaseClient
                .from("order_items")
                .delete()
                .eq(
                    "order_id",
                    id
                );


        if (itemsError) {

            console.error(
                itemsError
            );

            alert(
                "حدث خطأ أثناء حذف منتجات الطلب:\n" +
                itemsError.message
            );

            return;

        }


        const {
            error
        } =
            await supabaseClient
                .from("orders")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                error
            );

            alert(
                "حدث خطأ أثناء حذف الطلب:\n" +
                error.message
            );

            return;

        }


        await loadAdminOrders();

    }

    catch (error) {

        console.error(
            "Delete Order Error:",
            error
        );

        alert(
            "حدث خطأ أثناء حذف الطلب"
        );

    }

}


/* =========================================================
   نافذة تعديل الطلب
========================================================= */

const editOrderModal =
    document.getElementById(
        "editOrderModal"
    );

const editOrderNumber =
    document.getElementById(
        "editOrderNumber"
    );

const closeEditOrderButton =
    document.getElementById(
        "closeEditOrderButton"
    );

const cancelOrderEditButton =
    document.getElementById(
        "cancelOrderEditButton"
    );

const saveOrderEditButton =
    document.getElementById(
        "saveOrderEditButton"
    );

const editOrderMessage =
    document.getElementById(
        "editOrderMessage"
    );

const editOrderCustomerName =
    document.getElementById(
        "editOrderCustomerName"
    );

const editOrderCustomerPhone =
    document.getElementById(
        "editOrderCustomerPhone"
    );

const editOrderDriverName =
    document.getElementById(
        "editOrderDriverName"
    );

const editOrderDriverNumber =
    document.getElementById(
        "editOrderDriverNumber"
    );

const editOrderItems =
    document.getElementById(
        "editOrderItems"
    );

const editOrderTotal =
    document.getElementById(
        "editOrderTotal"
    );

const addOrderItemButton =
    document.getElementById(
        "addOrderItemButton"
    );


let editingOrderId =
    null;

let editingOrderItems =
    [];


/* =========================================================
   فتح تعديل الطلب
========================================================= */

async function openEditOrder(id) {

    editingOrderId =
        id;


    editOrderMessage.textContent =
        "";


    editOrderModal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";


    editOrderNumber.textContent =
        "الطلب #" + id;


    editOrderItems.innerHTML = `
        <div class="loading">
            جاري تحميل بيانات الطلب...
        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("orders")
                .select(`
                    *,
                    order_items (
                        *
                    )
                `)
                .eq(
                    "id",
                    id
                )
                .single();


        if (error) {

            console.error(
                error
            );

            editOrderMessage.textContent =
                error.message;

            editOrderMessage.style.color =
                "#e05265";

            return;

        }


        editOrderCustomerName.value =
            data.customer_name ||
            "";

        editOrderCustomerPhone.value =
            data.customer_phone ||
            "";

        editOrderDriverName.value =
            data.driver_name ||
            "";

        editOrderDriverNumber.value =
            data.driver_number ||
            "";


        editingOrderItems =
            (data.order_items || [])
                .map(
                    item => ({
                        ...item
                    })
                );


        renderEditOrderItems();

    }

    catch (error) {

        console.error(
            "Open Edit Order Error:",
            error
        );

        editOrderMessage.textContent =
            "حدث خطأ أثناء تحميل الطلب";

        editOrderMessage.style.color =
            "#e05265";

    }

}


/* =========================================================
   عرض منتجات الطلب في نافذة التعديل
========================================================= */

function renderEditOrderItems() {

    editOrderItems.innerHTML =
        "";


    if (!editingOrderItems.length) {

        editOrderItems.innerHTML = `
            <div class="message">
                لا توجد منتجات في الطلب
            </div>
        `;

        updateEditOrderTotal();

        return;

    }


    editingOrderItems.forEach(
        (item, index) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "edit-order-item";


            row.innerHTML = `

                <div
                    class="edit-order-item-image"
                >

                    ${
                        item.image
                        ?
                        `
                            <img
                                src="${escapeHtmlAttribute(item.image)}"
                                alt=""
                            >
                        `
                        :
                        "📦"
                    }

                </div>


                <div
                    class="edit-order-item-info"
                >

                    <strong>
                        ${
                            escapeHtmlAttribute(
                                item.model ||
                                "بدون موديل"
                            )
                        }
                    </strong>

                    <span>
                        ${
                            escapeHtmlAttribute(
                                item.company ||
                                ""
                            )
                        }
                    </span>

                </div>


                <div
                    class="edit-order-item-fields"
                >

                    <label>
                        الكمية

                        <input
                            type="number"
                            min="1"
                            value="${
                                item.quantity ??
                                1
                            }"
                            data-index="${index}"
                            class="edit-item-quantity"
                        >

                    </label>


                    <label>
                        السعر

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value="${
                                item.price ??
                                0
                            }"
                            data-index="${index}"
                            class="edit-item-price"
                        >

                    </label>

                </div>


                <button
                    type="button"
                    class="remove-edit-item"
                    data-index="${index}"
                >
                    🗑️
                </button>

            `;


            editOrderItems.appendChild(
                row
            );

        }
    );


    editOrderItems
        .querySelectorAll(
            ".edit-item-quantity"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );

                        editingOrderItems[
                            index
                        ].quantity =
                            Number(
                                this.value
                            ) || 1;

                        updateEditOrderTotal();

                    }
                );

            }
        );


    editOrderItems
        .querySelectorAll(
            ".edit-item-price"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );

                        editingOrderItems[
                            index
                        ].price =
                            Number(
                                this.value
                            ) || 0;

                        updateEditOrderTotal();

                    }
                );

            }
        );


    editOrderItems
        .querySelectorAll(
            ".remove-edit-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );

                        editingOrderItems.splice(
                            index,
                            1
                        );

                        renderEditOrderItems();

                    }
                );

            }
        );


    updateEditOrderTotal();

}


/* =========================================================
   حساب إجمالي الطلب
========================================================= */

function updateEditOrderTotal() {

    const total =
        editingOrderItems.reduce(
            (
                sum,
                item
            ) => {

                const quantity =
                    Number(
                        item.quantity ||
                        0
                    );

                const price =
                    Number(
                        item.price ||
                        0
                    );

                return (
                    sum +
                    (
                        quantity *
                        price
                    )
                );

            },
            0
        );


    editOrderTotal.textContent =
        total.toFixed(2);

}


/* =========================================================
   حفظ تعديل الطلب
========================================================= */

saveOrderEditButton.addEventListener(
    "click",
    saveOrderEdit
);


async function saveOrderEdit() {

    if (!editingOrderId) {

        return;

    }


    saveOrderEditButton.disabled =
        true;

    saveOrderEditButton.textContent =
        "جاري الحفظ...";


    editOrderMessage.textContent =
        "";


    try {

        /* =========================
           حساب الإجمالي
        ========================= */

        const total =
            editingOrderItems.reduce(
                (
                    sum,
                    item
                ) => {

                    return (
                        sum +
                        (
                            Number(
                                item.quantity ||
                                0
                            ) *
                            Number(
                                item.price ||
                                0
                            )
                        )
                    );

                },
                0
            );


        /* =========================
           تحديث بيانات الطلب
        ========================= */

        const {
            error:
                orderError
        } =
            await supabaseClient
                .from("orders")
                .update({

                    customer_name:
                        editOrderCustomerName.value.trim(),

                    customer_phone:
                        editOrderCustomerPhone.value.trim(),

                    driver_name:
                        editOrderDriverName.value.trim(),

                    driver_number:
                        editOrderDriverNumber.value.trim(),

                    total:
                        total

                })
                .eq(
                    "id",
                    editingOrderId
                );


        if (orderError) {

            throw orderError;

        }


        /* =========================
           تحديث المنتجات
        ========================= */

        for (
            const item
            of editingOrderItems
        ) {

            if (item.id) {

                const {
                    error
                } =
                    await supabaseClient
                        .from("order_items")
                        .update({

                            quantity:
                                Number(
                                    item.quantity ||
                                    1
                                ),

                            price:
                                Number(
                                    item.price ||
                                    0
                                )

                        })
                        .eq(
                            "id",
                            item.id
                        );


                if (error) {

                    throw error;

                }

            }

            else {

                const {
                    error
                } =
                    await supabaseClient
                        .from("order_items")
                        .insert({

                            order_id:
                                editingOrderId,

                            product_id:
                                item.product_id,

                            product_code:
                                item.product_code ||
                                null,

                            category:
                                item.category ||
                                null,

                            product_type:
                                item.product_type ||
                                null,

                            type:
                                item.type ||
                                null,

                            company:
                                item.company ||
                                null,

                            model:
                                item.model ||
                                null,

                            color:
                                item.color ||
                                null,

                            quantity:
                                Number(
                                    item.quantity ||
                                    1
                                ),

                            price:
                                Number(
                                    item.price ||
                                    0
                                ),

                            image:
                                item.image ||
                                null

                        });


                if (error) {

                    throw error;

                }

            }

        }


        /* =========================
           رسالة نجاح
        ========================= */

        editOrderMessage.textContent =
            "تم حفظ تعديلات الطلب بنجاح ✅";

        editOrderMessage.style.color =
            "#2e9d69";


        await loadAdminOrders();


        setTimeout(
            function () {

                closeEditOrder();

            },
            700
        );

    }

    catch (error) {

        console.error(
            "Save Order Edit Error:",
            error
        );

        editOrderMessage.textContent =
            error.message;

        editOrderMessage.style.color =
            "#e05265";

    }

    finally {

        saveOrderEditButton.disabled =
            false;

        saveOrderEditButton.textContent =
            "حفظ التعديلات";

    }

}


/* =========================================================
   إغلاق نافذة التعديل
========================================================= */

function closeEditOrder() {

    editOrderModal.style.display =
        "none";

    document.body.style.overflow =
        "";

    editingOrderId = null;

    editingOrderItems = [];

}


/* =========================================================
   أزرار الإغلاق
========================================================= */

closeEditOrderButton.addEventListener(
    "click",
    closeEditOrder
);


cancelOrderEditButton.addEventListener(
    "click",
    closeEditOrder
);


/* إغلاق عند الضغط خارج النافذة */

editOrderModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            editOrderModal
        ) {

            closeEditOrder();

        }

    }
);


/* =========================================================
   حماية النصوص داخل value=""
========================================================= */

function escapeHtmlAttribute(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}



/* =========================================================
   اختيار منتج لإضافته إلى الطلب
========================================================= */

addOrderItemButton.addEventListener(
    "click",
    async function () {

        addOrderItemButton.disabled =
            true;

        addOrderItemButton.textContent =
            "جاري تحميل المنتجات...";

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("products")
                    .select("*")
                    .order(
                        "id",
                        {
                            ascending: false
                        }
                    )
                    .limit(1000);


            if (error) {

                console.error(
                    "PRODUCT LOAD ERROR:",
                    error
                );

                alert(
                    "خطأ في تحميل المنتجات:\n\n" +
                    error.message
                );

                return;

            }


            console.log(
                "منتجات الإضافة:",
                data
            );


            if (
                !data ||
                data.length === 0
            ) {

                alert(
                    "لم يتم العثور على منتجات"
                );

                return;

            }


            showOrderProductList(
                data
            );

        }

        catch (error) {

            console.error(
                "ADD PRODUCT ERROR:",
                error
            );

            alert(
                "حدث خطأ:\n\n" +
                error.message
            );

        }

        finally {

            addOrderItemButton.disabled =
                false;

            addOrderItemButton.textContent =
                "+ إضافة منتج";

        }

    }
);


function showOrderProductList(
    products
) {

    const oldPicker =
        document.getElementById(
            "orderProductPicker"
        );


    if (oldPicker) {

        oldPicker.remove();

    }


    const picker =
        document.createElement(
            "div"
        );


    picker.id =
        "orderProductPicker";


    picker.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: rgba(0,0,0,.55);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;


    picker.innerHTML = `

        <div style="
            background:white;
            width:100%;
            max-width:700px;
            max-height:85vh;
            overflow:hidden;
            border-radius:20px;
            padding:20px;
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:15px;
            ">

                <h3 style="margin:0;">
                    اختر المنتج
                </h3>

                <button
                    type="button"
                    onclick="closeOrderProductPicker()"
                    style="
                        border:none;
                        background:#eee;
                        border-radius:10px;
                        width:38px;
                        height:38px;
                        cursor:pointer;
                    "
                >
                    ✕
                </button>

            </div>


            <input
                id="orderProductSearch"
                type="text"
                placeholder="ابحث عن موديل أو شركة..."
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:13px;
                    border:1px solid #ddd;
                    border-radius:12px;
                    margin-bottom:15px;
                    font-family:inherit;
                "
            >


            <div
                id="orderProductList"
                style="
                    max-height:60vh;
                    overflow-y:auto;
                "
            ></div>

        </div>
    `;


    document.body.appendChild(
        picker
    );


    renderOrderProductList(
        products
    );


    document
        .getElementById(
            "orderProductSearch"
        )
        .addEventListener(
            "input",
            function () {

                const search =
                    this.value
                        .trim()
                        .toLowerCase();


                const filtered =
                    products.filter(
                        product => {

                            const text = `
                        ${product.model || ""}
                        ${product.company || ""}
                        ${product.product_code || ""}
                        ${product.category || ""}
                        ${product.product_type || ""}
                        ${product.type || ""}
                    `.toLowerCase();


                            return text.includes(
                                search
                            );

                        }
                    );


                renderOrderProductList(
                    filtered
                );

            }
        );

}


function renderOrderProductList(
    products
) {

    const list =
        document.getElementById(
            "orderProductList"
        );


    if (!list) return;


    list.innerHTML =
        "";


    products.forEach(
        product => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.style.cssText = `
            width:100%;
            display:flex;
            align-items:center;
            gap:12px;
            padding:12px;
            margin-bottom:8px;
            border:1px solid #eee;
            border-radius:12px;
            background:white;
            cursor:pointer;
            text-align:right;
            font-family:inherit;
        `;


            button.innerHTML = `

            <div style="
                width:55px;
                height:55px;
                border-radius:10px;
                overflow:hidden;
                background:#f3f3f3;
                display:flex;
                align-items:center;
                justify-content:center;
                flex-shrink:0;
            ">

                ${
                    product.image
                    ?
                    `<img
                        src="${escapeHtmlAttribute(product.image)}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                        "
                    >`
                    :
                    "📦"
                }

            </div>


            <div>

                <strong>
                    ${escapeHtmlAttribute(
                        product.model ||
                        "بدون موديل"
                    )}
                </strong>

                <div style="
                    color:#777;
                    font-size:12px;
                    margin-top:4px;
                ">

                    ${escapeHtmlAttribute(
                        product.company || ""
                    )}

                    ${
                        product.color
                        ?
                        " • " +
                        escapeHtmlAttribute(
                            product.color
                        )
                        :
                        ""
                    }

                </div>


                <div style="
                    color:#6557ed;
                    font-size:12px;
                    margin-top:4px;
                ">

                    ${Number(
                        product.price || 0
                    ).toFixed(2)} ر.س

                </div>

            </div>

        `;


            button.addEventListener(
                "click",
                function () {

                    addProductToCurrentOrder(
                        product
                    );

                }
            );


            list.appendChild(
                button
            );

        }
    );

}


function addProductToCurrentOrder(
    product
) {

    if (
        !product ||
        !product.id
    ) {

        alert(
            "المنتج لا يحتوي على رقم product_id"
        );

        return;

    }


    editingOrderItems.push({

        id: null,

        order_id:
            editingOrderId,

        product_id:
            product.id,

        product_code:
            product.product_code ||
            null,

        category:
            product.category ||
            null,

        product_type:
            product.product_type ||
            null,

        type:
            product.type ||
            null,

        company:
            product.company ||
            null,

        model:
            product.model ||
            null,

        color:
            product.color ||
            null,

        quantity:
            1,

        price:
            Number(
                product.price ||
                0
            ),

        image:
            product.image ||
            null

    });


    closeOrderProductPicker();

    renderEditOrderItems();

}


function closeOrderProductPicker() {

    const picker =
        document.getElementById(
            "orderProductPicker"
        );


    if (picker) {

        picker.remove();

    }

}function closeOrderProductPicker() {

    const picker =
        document.getElementById(
            "orderProductPicker"
        );


    if (picker) {

        picker.remove();

    }

}