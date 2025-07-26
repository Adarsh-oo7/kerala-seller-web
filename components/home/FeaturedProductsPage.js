import React from "react"
import ProductCard from "../common/ProductCard"

const featuredProducts = [
  {
    id: 1,
    title: "Floral Maxi Dress",
    price: 1299,
    image: "https://i.pinimg.com/originals/1a/9e/61/1a9e6194ca3f2399e736da9171e4156a.png",
  },
  {
    id: 2,
    title: "Co-ord Set Blue",
    price: 1499,
    image: "https://invitadisima.com/103953-thickbox_default/party-dress-with-square-neckline-and-flowing-skirt.jpg",
  },
  {
    id: 3,
    title: "Red Party Gown",
    price: 1799,
    image: "https://tse4.mm.bing.net/th/id/OIP.Zmmh96wQRCDszRAhX4GHNAHaJ4?pid=Api&P=0&h=220",
  },
  {
    id: 4,
    title: "Casual Kurti",
    price: 899,
    image: "https://tse4.mm.bing.net/th/id/OIP.KCEGXA1dk-A9aVzPsWIzegHaJ4?pid=Api&P=0&h=220",
  },
  {
    id: 5,
    title: "Silk Salwar Suit",
    price: 1599,
    image: "https://www.litlookzstudio.com/cdn/shop/files/Square-Neck-Corset-Mini-Dress-2.webp?v=1738325160&width=1200",
  },
]

export default function FeaturedProductsPage() {
  return (
    <section className="featured-products">
      <div className="header-row">
        <h2 className="section-title">Featured Products</h2>
        <button className="view-all-btn">View All</button>
      </div>

      <div className="featured-grid">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  )
}
