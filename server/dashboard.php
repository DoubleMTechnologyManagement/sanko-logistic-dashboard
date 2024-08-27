<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json; charset=UTF-8');

$req = json_decode(file_get_contents("php://input"), true);
require_once("dashboard_services.php");
$func = new dashboard();

switch($req["mod"]) {
    case "scheduleData": $data = $func->scheduleData(); break;
    case "setTime": $data = $func->setTime(); break;
    default: $data["message"] = "Not found!"; break; 
}

$res = json_encode($data);
echo $res;
