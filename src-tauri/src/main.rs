// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::alphabet::Alphabet;
use base64::engine::{general_purpose, GeneralPurpose, GeneralPurposeConfig};
use serde_json as json;

use base64::Engine;
use image::io::Reader as ImageReader;

use std::io::Cursor;
use std::path::Path;
use std::sync::Mutex;
use std::{cell::RefCell, fs, rc::Rc};

use narra::narra_front::NarraEventHandler;
use narra::narra_runtime::NarraRuntime;
use narra_rs as narra;

pub struct NarraHandler {
    current_action: json::Value,
}

impl NarraHandler {
    pub fn new() -> NarraHandler {
        NarraHandler {
            current_action: json::Value::Null,
        }
    }
    pub fn next_action() {}
}

impl NarraEventHandler for NarraHandler {
    fn handle_dialogue(
        &mut self,
        character_name: Option<String>,
        text: String,
        modifiers: json::Map<String, json::Value>,
    ) -> () {
        self.current_action = json::json!({
            "event_type":"Dialogue",
            "character_name": character_name,
            "text":text,
            "modifiers":modifiers
        })
    }

    fn handle_choice(
        &mut self,
        choice_texts: Vec<String>,
        modifiers: json::Map<String, json::Value>,
    ) {
        self.current_action = json::json!({
            "event_type":"Choice",
            "choices":json::json!(choice_texts),
            "modifiers":modifiers
        })
    }
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

type MutexNarraRT = std::sync::Mutex<NarraRuntime<NarraHandler>>;
type MutexNarraHandler = std::sync::Mutex<Rc<RefCell<NarraHandler>>>;
type MutexArchivePath = std::sync::Mutex<String>;
struct NarraState {
    mutex_narra: MutexNarraRT,
    mutex_handler: MutexNarraHandler,
    game_archive_path: MutexArchivePath,
}
unsafe impl Send for NarraState {}
unsafe impl Sync for NarraState {}

#[tauri::command]
fn get_current_action(state: tauri::State<'_, NarraState>) -> String {
    state
        .mutex_handler
        .lock()
        .unwrap()
        .borrow_mut()
        .current_action
        .to_string()
}

#[tauri::command]
fn next_action(state: tauri::State<'_, NarraState>) {
    // println!(
    //     "{}",
    //     state
    //         .mutex_handler
    //         .lock()
    //         .unwrap()
    //         .borrow_mut()
    //         .current_action
    // );
    state.mutex_narra.lock().unwrap().handle_action();
}

#[tauri::command]
fn perform_choice(state: tauri::State<'_, NarraState>, choice: usize) {
    state.mutex_narra.lock().unwrap().perform_choice(choice);
}

#[tauri::command]
fn read_game(state: tauri::State<'_, NarraState>, game_archive_path: String) {
    *state.game_archive_path.lock().unwrap() = game_archive_path.clone();
    let compiled_file = fs::read_to_string(Path::new(&game_archive_path).join("game.nb")).unwrap();
    state.mutex_narra.lock().unwrap().read_file(compiled_file);
    state.mutex_narra.lock().unwrap().init();
}

#[tauri::command]
fn get_image(state: tauri::State<'_, NarraState>, image_filepath: String) -> String {
    println!("{image_filepath}");
    let archive_path = state.game_archive_path.lock().unwrap().clone();

    let img = ImageReader::open(Path::new(&archive_path).join(image_filepath))
        .unwrap()
        .decode()
        .unwrap();

    let mut buf = Cursor::new(Vec::new());
    img.write_to(&mut buf, image::ImageOutputFormat::Png)
        .unwrap();
    let img_bytes = buf.into_inner();

    let b64 = general_purpose::STANDARD.encode(&img_bytes);
    b64
}

fn main() {
    let handler = NarraHandler::new();
    let handler_ptr = Rc::new(RefCell::new(handler));
    let narra_rt = NarraRuntime::new(handler_ptr.clone());
    let narra_state = NarraState {
        mutex_narra: Mutex::new(narra_rt),
        mutex_handler: Mutex::new(handler_ptr.clone()),
        game_archive_path: Mutex::new(String::new()),
    };
    tauri::Builder::default()
        .manage(narra_state)
        .invoke_handler(tauri::generate_handler![
            next_action,
            get_current_action,
            perform_choice,
            read_game,
            get_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
