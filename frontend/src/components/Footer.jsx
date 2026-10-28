import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
    <footer className="footer">
        <div className="footer-content">
            <div className="footer-brand">
                <h2>Gauri Godse</h2>
                <p>Authentic Homemade Diwali Faral</p>
                <p className="footer-address">Adress-plot no:32 Ashok nagar bhingardive mala gulmohar road Savedi, Ahilyanagar, Maharashtra</p>
            </div>
            <ul className="footer-links">
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms &amp; Conditions</Link></li>
            </ul>
        </div>
        <p className="footer-copyright">&copy; 2026 Gauri Godse Faral. All rights reserved.</p>
        <p className="footer-credit">
            Website designed & developed by <strong>Ayush Godse</strong> ·{" "}
            <a href="tel:9579160349">9579160349</a>
        </p>
    </footer>
);

export default Footer;