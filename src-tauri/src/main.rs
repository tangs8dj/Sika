// Prevents an additional console window on Windows release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    batch_place_card_generator_lib::run();
}
