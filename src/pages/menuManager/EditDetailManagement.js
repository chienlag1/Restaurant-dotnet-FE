import EditDetailManagement from "../../components/EditDetailManagement.js"; // Import modal hiển thị chi tiết món ăn

const MenuManagement = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Danh sách món ăn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {filteredItems.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={() => setSelectedProduct(product)} // Chọn sản phẩm khi nhấn "Xem"
            onDelete={() => console.log("Xóa món ăn")}
          />
        ))}
      </div>

      {/* Modal hiển thị chi tiết món ăn */}
      <EditDetailManagement
        selectedProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
