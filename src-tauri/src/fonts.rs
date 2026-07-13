use std::collections::BTreeSet;

const FALLBACK_FONTS: &[&str] = &[
    "Microsoft YaHei",
    "SimHei",
    "SimSun",
    "KaiTi",
    "FangSong",
    "Arial",
    "Calibri",
    "Times New Roman",
];

fn fallback_fonts() -> Vec<String> {
    FALLBACK_FONTS
        .iter()
        .map(|font_name| (*font_name).to_owned())
        .collect()
}

fn load_system_font_families() -> Vec<String> {
    let mut database = fontdb::Database::new();
    database.load_system_fonts();

    let names = database
        .faces()
        .flat_map(|face| face.families.iter().map(|(name, _)| name.clone()))
        .filter(|name| !name.trim().is_empty())
        .collect::<BTreeSet<_>>();

    names.into_iter().collect()
}

#[tauri::command]
pub fn list_system_fonts() -> Result<Vec<String>, String> {
    // Font files can be malformed or inaccessible. A failed scan should never
    // prevent the application from starting, so fall back to a known list.
    let fonts = std::panic::catch_unwind(load_system_font_families)
        .ok()
        .filter(|font_names| !font_names.is_empty())
        .unwrap_or_else(fallback_fonts);

    Ok(fonts)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fallback_font_list_is_not_empty() {
        assert!(!fallback_fonts().is_empty());
    }

    #[test]
    fn fallback_font_list_contains_windows_cjk_font() {
        assert!(fallback_fonts().iter().any(|font| font == "Microsoft YaHei"));
    }
}
