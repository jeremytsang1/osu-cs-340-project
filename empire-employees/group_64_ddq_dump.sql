-- MySQL dump 10.13  Distrib 8.0.21, for Linux (x86_64)
--
-- Host: classmysql.engr.oregonstate.edu    Database: cs340_tsangj
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.13-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `droids`
--

DROP TABLE IF EXISTS `droids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `droids` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `droids`
--

LOCK TABLES `droids` WRITE;
/*!40000 ALTER TABLE `droids` DISABLE KEYS */;
INSERT INTO `droids` VALUES (1,'Protocol'),(2,'Astromech'),(3,'Battle');
/*!40000 ALTER TABLE `droids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garrisons`
--

DROP TABLE IF EXISTS `garrisons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garrisons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `capacity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garrisons`
--

LOCK TABLES `garrisons` WRITE;
/*!40000 ALTER TABLE `garrisons` DISABLE KEYS */;
INSERT INTO `garrisons` VALUES (1,'Tatooine',10000),(2,'Coruscant',100000),(3,'Kashyyk',5000);
/*!40000 ALTER TABLE `garrisons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loadouts`
--

DROP TABLE IF EXISTS `loadouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loadouts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blaster` varchar(255) NOT NULL,
  `detonator` varchar(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loadouts`
--

LOCK TABLES `loadouts` WRITE;
/*!40000 ALTER TABLE `loadouts` DISABLE KEYS */;
INSERT INTO `loadouts` VALUES (1,'EL-16','Thermal'),(2,'E-11','Sonic'),(3,'DC-15A','Sonic');
/*!40000 ALTER TABLE `loadouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ships`
--

DROP TABLE IF EXISTS `ships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ships` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ships`
--

LOCK TABLES `ships` WRITE;
/*!40000 ALTER TABLE `ships` DISABLE KEYS */;
INSERT INTO `ships` VALUES (1,'Star Destroyer'),(2,'AT-AT'),(3,'TIE Fighter');
/*!40000 ALTER TABLE `ships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ships_droids`
--

DROP TABLE IF EXISTS `ships_droids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ships_droids` (
  `ship` int(11) NOT NULL,
  `droid` int(11) NOT NULL,
  PRIMARY KEY (`ship`,`droid`),
  KEY `fk_ships_droids_droid` (`droid`),
  CONSTRAINT `fk_ships_droids_droid` FOREIGN KEY (`droid`) REFERENCES `droids` (`id`),
  CONSTRAINT `fk_ships_droids_ship` FOREIGN KEY (`ship`) REFERENCES `ships` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ships_droids`
--

LOCK TABLES `ships_droids` WRITE;
/*!40000 ALTER TABLE `ships_droids` DISABLE KEYS */;
INSERT INTO `ships_droids` VALUES (1,2),(2,1),(3,3);
/*!40000 ALTER TABLE `ships_droids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ships_troopers`
--

DROP TABLE IF EXISTS `ships_troopers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ships_troopers` (
  `ship` int(11) NOT NULL,
  `trooper` int(11) NOT NULL,
  PRIMARY KEY (`ship`,`trooper`),
  KEY `fk_ships_troopers_trooper` (`trooper`),
  CONSTRAINT `fk_ships_troopers_ship` FOREIGN KEY (`ship`) REFERENCES `ships` (`id`),
  CONSTRAINT `fk_ships_troopers_trooper` FOREIGN KEY (`trooper`) REFERENCES `troopers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ships_troopers`
--

LOCK TABLES `ships_troopers` WRITE;
/*!40000 ALTER TABLE `ships_troopers` DISABLE KEYS */;
INSERT INTO `ships_troopers` VALUES (1,2191),(2,2187),(3,2199);
/*!40000 ALTER TABLE `ships_troopers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `troopers`
--

DROP TABLE IF EXISTS `troopers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `troopers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `garrison` int(11) DEFAULT NULL,
  `loadout` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_troopers_garrison` (`garrison`),
  KEY `fk_troopers_loadout` (`loadout`),
  CONSTRAINT `fk_troopers_garrison` FOREIGN KEY (`garrison`) REFERENCES `garrisons` (`id`),
  CONSTRAINT `fk_troopers_loadout` FOREIGN KEY (`loadout`) REFERENCES `loadouts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2200 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `troopers`
--

LOCK TABLES `troopers` WRITE;
/*!40000 ALTER TABLE `troopers` DISABLE KEYS */;
INSERT INTO `troopers` VALUES (2187,NULL,1),(2188,1,2),(2189,2,3),(2190,3,3),(2191,3,3),(2199,3,3);
/*!40000 ALTER TABLE `troopers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-08-04 16:40:52
