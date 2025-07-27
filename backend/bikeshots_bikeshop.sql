-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 27, 2025 at 09:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bikeshots_bikeshop`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `service_category` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `status` enum('Pending','Accepted','Declined') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `service_category`, `description`, `appointment_date`, `appointment_time`, `status`, `created_at`) VALUES
(1, 11, 'Derailleur Tuning', 'tuning', '2025-07-29', '10:30:00', 'Accepted', '2025-07-27 06:20:27'),
(2, 11, 'Vulcanize', 'vulcanize', '2025-07-29', '15:00:00', 'Declined', '2025-07-27 06:23:12'),
(3, 11, 'Maintenance', 'maintainance', '2025-07-30', '14:30:00', 'Accepted', '2025-07-27 06:23:29');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(2, 'Accessories'),
(1, 'Bike Frames'),
(4, 'Brakes'),
(5, 'Fork'),
(6, 'Pedal'),
(3, 'Tires');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_method` varchar(20) NOT NULL,
  `address` text DEFAULT NULL,
  `status` enum('Pending','Approved','Denied','Cancelled','Processing','Ready for Delivery','Ready for Pickup','Completed') DEFAULT 'Pending',
  `denial_reason` text DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `total_price`, `created_at`, `delivery_method`, `address`, `status`, `denial_reason`, `deleted_at`) VALUES
(12, 6, 523.00, '2025-06-24 09:13:48', '', NULL, 'Cancelled', NULL, NULL),
(13, 6, 123.00, '2025-07-16 08:33:19', '', NULL, 'Ready for Delivery', NULL, NULL),
(14, 6, 123.00, '2025-07-16 08:34:23', '', NULL, 'Approved', NULL, NULL),
(15, 6, 369.00, '2025-07-16 08:38:27', 'pickup', NULL, 'Approved', NULL, NULL),
(16, 6, 369.00, '2025-07-16 08:39:44', 'pickup', NULL, 'Approved', NULL, NULL),
(17, 6, 369.00, '2025-07-16 08:39:52', 'pickup', NULL, 'Approved', NULL, NULL),
(18, 6, 369.00, '2025-07-16 08:51:50', 'delivery', NULL, 'Ready for Delivery', NULL, NULL),
(19, 6, 369.00, '2025-07-16 08:54:07', 'pickup', NULL, 'Ready for Pickup', NULL, NULL),
(20, 6, 369.00, '2025-07-16 08:54:41', 'delivery', NULL, 'Processing', NULL, NULL),
(21, 6, 1234.00, '2025-07-16 09:13:10', 'delivery', NULL, 'Ready for Delivery', NULL, NULL),
(22, 6, 123.00, '2025-07-16 09:41:42', 'delivery', NULL, 'Completed', NULL, NULL),
(23, 6, 123.00, '2025-07-16 09:42:11', 'delivery', 'mamatid', 'Processing', NULL, NULL),
(24, 6, 123.00, '2025-07-16 10:09:31', 'delivery', NULL, 'Denied', NULL, NULL),
(25, 6, 246.00, '2025-07-16 10:10:24', 'delivery', 'adwada', 'Completed', NULL, NULL),
(26, 6, 369.00, '2025-07-16 10:33:26', 'delivery', 'Blk 40 Lot 10', 'Completed', NULL, NULL),
(27, 6, 123.00, '2025-07-16 12:12:54', 'delivery', 'wdadwaqd', 'Completed', NULL, NULL),
(28, 6, 123.00, '2025-07-16 12:28:41', 'pickup', NULL, 'Denied', NULL, NULL),
(29, 6, 246.00, '2025-07-16 12:33:06', 'delivery', 'Mamatid', 'Denied', NULL, NULL),
(30, 6, 246.00, '2025-07-17 05:17:41', 'delivery', 'Baaclaaran', 'Denied', NULL, NULL),
(31, 6, 246.00, '2025-07-17 07:51:53', 'pickup', NULL, 'Completed', NULL, NULL),
(32, 6, 523.00, '2025-07-17 10:45:53', 'delivery', 'Bpl 40 Lot 10', 'Cancelled', NULL, NULL),
(33, 9, 600.00, '2025-07-18 07:25:38', 'delivery', 'Mamatid', 'Completed', NULL, NULL),
(34, 9, 246.00, '2025-07-20 12:55:47', 'pickup', NULL, 'Approved', NULL, NULL),
(35, 9, 1200.00, '2025-07-20 13:15:16', 'pickup', NULL, 'Approved', NULL, NULL),
(36, 9, 1200.00, '2025-07-20 16:22:01', 'pickup', NULL, 'Processing', NULL, NULL),
(37, 9, 984.00, '2025-07-20 16:40:13', 'pickup', NULL, 'Approved', NULL, NULL),
(38, 6, 984.00, '2025-07-20 17:29:33', 'pickup', NULL, 'Approved', NULL, NULL),
(39, 9, 2034.00, '2025-07-20 17:39:03', 'pickup', NULL, 'Approved', NULL, NULL),
(40, 6, 1234.00, '2025-07-20 17:39:49', 'pickup', NULL, 'Denied', NULL, NULL),
(41, 11, 400.00, '2025-07-27 06:20:09', 'delivery', 'mamatid', 'Completed', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(12, 12, 21, 1, 123.00),
(13, 12, 23, 1, 400.00),
(14, 13, 21, 1, 123.00),
(15, 14, 21, 1, 123.00),
(16, 15, 24, 3, 123.00),
(17, 16, 24, 3, 123.00),
(18, 17, 24, 3, 123.00),
(19, 18, 24, 3, 123.00),
(20, 19, 24, 3, 123.00),
(21, 20, 21, 3, 123.00),
(22, 21, 26, 1, 1234.00),
(23, 22, 21, 1, 123.00),
(24, 23, 22, 1, 123.00),
(25, 24, 21, 1, 123.00),
(26, 25, 21, 2, 123.00),
(27, 26, 21, 3, 123.00),
(28, 27, 21, 1, 123.00),
(29, 28, 21, 1, 123.00),
(30, 29, 21, 2, 123.00),
(31, 30, 21, 2, 123.00),
(32, 31, 21, 2, 123.00),
(33, 32, 22, 1, 123.00),
(34, 32, 23, 1, 400.00),
(35, 33, 35, 2, 300.00),
(36, 34, 22, 2, 123.00),
(37, 35, 23, 3, 400.00),
(38, 36, 23, 3, 400.00),
(39, 37, 21, 8, 123.00),
(40, 38, 21, 8, 123.00),
(41, 39, 23, 2, 400.00),
(42, 39, 25, 1, 1234.00),
(43, 40, 25, 1, 1234.00),
(44, 41, 23, 1, 400.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `is_out_of_stock` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `image`, `created_at`, `category_id`, `quantity`, `is_out_of_stock`) VALUES
(21, 'Brake 33333333', 'no1 brake', 123.00, '1750685806539.png', '2025-06-23 13:36:46', 4, 5, 0),
(22, 'brake 2', 'no 2 brake', 123.00, '1750685825883.jpg', '2025-06-23 13:37:05', 4, 5, 0),
(23, 'Bike Light', 'light', 400.00, '1750685890349.jpg', '2025-06-23 13:38:10', 2, 4, 0),
(24, 'bike lock', 'lock', 123.00, '1750686058990.jpg', '2025-06-23 13:40:58', 2, 1, 0),
(25, 'Bike Frame 1', 'frame1', 1234.00, '1750686104267.jpg', '2025-06-23 13:41:44', 1, 0, 0),
(26, 'Bike Frame 2', 'frame2', 1234.00, '1750686125809.jpg', '2025-06-23 13:42:05', 1, 1, 0),
(27, 'Bike Tires ', 'Tires 1', 340.00, '1750686824099.jpg', '2025-06-23 13:53:44', 3, 1, 0),
(35, 'Fork', 'New', 300.00, '1752725755371.jpg', '2025-07-17 04:13:55', 5, 2, 0),
(38, 'Fork2', '2nd hand', 200.00, '1752816336818.jpg', '2025-07-18 05:25:36', 5, 1, 0),
(41, 'Pedal', 'Brand New', 500.00, '1752902634151.jpg', '2025-07-19 05:23:54', 6, 2, 0),
(42, 'Pedal2', 'new ', 500.00, '1753060380534.jpg', '2025-07-21 01:13:00', 6, 3, 0),
(43, 'Tire 2', '2nd hand', 300.00, '1753060597254.jpg', '2025-07-21 01:16:37', 3, 4, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','staff','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(6, 'user', 'user@gmail.com', '$2b$10$.079iK6GLzzXYGPs1rwejOl7ZJ1hLN5y.y.ButCJfoU3X5vxj7fim', 'user', '2025-06-21 12:10:02'),
(7, 'admin', 'admin@gmail.com', '$2b$10$blKtp0QHmXN.YKppI6Mx/uEZ0BQr8sEhR4PhEGN4ujye6U5cLYHvS', 'admin', '2025-06-21 12:25:51'),
(8, 'staff', 'staff@gmail.com', '$2b$10$oem4Jv5I0C5Zwwa82/WIaetO8AH1W//ln/9sKcWyW9.ih3vGZtXLa', 'staff', '2025-06-21 12:26:19'),
(9, 'user2', 'user2@gmail.com', '$2b$10$JZoV/tLHE1pfE8NGI7z/I.e5dioNJkseOkDAUk.Dkw533gKrrPRye', 'user', '2025-06-22 07:03:55'),
(10, 'admin2', 'admin2@gmail.com', '$2b$10$4u8Wn1hmAi7ps4lSatrIcute030.F25.5xJAPv9NwmUSGiXOW2Td2', 'admin', '2025-07-17 08:07:21'),
(11, 'chris john ampeloquio', 'tes@gmail.com', '$2b$10$PZ66WuSk.mxnxRbMXqIJcuZNHxXCmPjZ7podCMvJVHLeq.6S50wA2', 'user', '2025-07-27 06:19:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_product_unique` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
