import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'listing.dart';

class DirectoryRepository {
  DirectoryRepository({http.Client? client, SharedPreferences? preferences, String? baseUrl})
      : _client = client ?? http.Client(),
        _preferences = preferences,
        _baseUrl = (baseUrl ?? const String.fromEnvironment(
          'API_BASE_URL', defaultValue: 'https://furfinder-rho.vercel.app',
        )).replaceFirst(RegExp(r'/+$'), '');

  static const _cacheKey = 'furfinder.public_listings.v1';
  final http.Client _client;
  SharedPreferences? _preferences;
  final String _baseUrl;
  Future<SharedPreferences> get _prefs async =>
      _preferences ??= await SharedPreferences.getInstance();

  Future<List<Listing>> fetchListings() async {
    final response = await _client.get(
      Uri.parse('$_baseUrl/api/v1/listings'),
      headers: const {'Accept': 'application/json'},
    ).timeout(const Duration(seconds: 12));
    if (response.statusCode != 200) {
      throw Exception('Directory request failed (${response.statusCode}).');
    }
    final decoded = jsonDecode(response.body);
    if (decoded is! Map<String, dynamic> || decoded['ok'] != true ||
        decoded['version'] != 'v1' || decoded['data'] is! List ||
        (decoded['data'] as List).length > 60) {
      throw const FormatException('Unexpected directory API response.');
    }
    final listings = (decoded['data'] as List).map((item) {
      if (item is! Map<String, dynamic>) {
        throw const FormatException('Invalid listing record.');
      }
      return Listing.fromJson(item);
    }).toList(growable: false);
    await (await _prefs).setString(_cacheKey, jsonEncode({
      'saved_at': DateTime.now().toUtc().toIso8601String(),
      'listings': listings.map((item) => item.toJson()).toList(),
    }));
    return listings;
  }

  Future<({List<Listing> listings, DateTime? savedAt})?> readCache() async {
    final prefs = await _prefs;
    final raw = prefs.getString(_cacheKey);
    if (raw == null) {
      return null;
    }
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map<String, dynamic> || decoded['listings'] is! List ||
          decoded['saved_at'] is! String) {
        return null;
      }
      final savedAt = DateTime.tryParse(decoded['saved_at'] as String);
      final listings = (decoded['listings'] as List).map((item) {
        if (item is! Map<String, dynamic>) {
          throw const FormatException('Invalid cached listing.');
        }
        return Listing.fromJson(item);
      }).toList(growable: false);
      return (listings: listings, savedAt: savedAt);
    } catch (_) {
      await prefs.remove(_cacheKey);
      return null;
    }
  }

  void dispose() => _client.close();
}
