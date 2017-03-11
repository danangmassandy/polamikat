function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

// Pagination
define("PAGE_SIZE",20);

// Entity Status
define("STATUS_ACTIVE", "active");
define("STATUS_INACTIVE", "inactive");
define("STATUS_PENDING", "pending");
define("STATUS_DEACTIVATED", "deactivated");
define("STATUS_NEW", "new");
define("STATUS_ENDED", "ended");
define("STATUS_TERMINATED", "terminated");
define("STATUS_ARCHIVED", "archived");

// Uploaded files
define("UPLOADED_FILE_TYPE_PROFILE_IMAGE", 0);
define("UPLOADED_FILE_TYPE_ACTIVITY_IMAGE", 1);

define("ROLE_ADMIN", "admin");
define("ROLE_USER", "user");

//ERROR
define("ERROR_FILE_TYPE", "Invalid file type.");
define("ERROR_FILE_SIZE", "File size too big.");
define("ERROR_IMG_DIMENSION", "Image dimension not suitable.");

//FILE VALIDATE VARIABLE
define("imgSizeLimit", 1024 * 1024 * 5);
define("pdfSizeLimit", 1024 * 1024 * 5);
define("dimensionLimit", {
    maxWidth : 1000,
    maxHeight : 1000
});
